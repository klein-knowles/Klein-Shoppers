import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
PUBLIC_JS = PUBLIC / "js"
LANGUAGE_ATTRIBUTES = {"alt", "aria-label", "placeholder", "title", "value"}
SPACE = re.compile(r"\s+")
TAG = re.compile(r"<[^>]*>")
INTERPOLATION = re.compile(r"\$\{[^{}]*\}")


def clean(value):
    value = SPACE.sub(" ", value).strip()
    return value if len(value) <= 350 else ""


def looks_translatable(value):
    if len(value) < 2 or not re.search(r"[A-Za-z\u00c0-\u024f\u4e00-\u9fff]", value):
        return False
    if re.match(r"^(?:https?:|/|data:|#[0-9a-f]{3,8}\b)", value, re.I):
        return False
    if (value[0] in {".", ","} or ".replace(" in value or ".addEventListener(" in value
            or ".classList." in value or re.search(r"\b\w[\w-]*\s+\.[\w-]+", value)
            or re.search(r"(?:^|\s),\s*\w+\s*,(?:\s|$)", value)):
        return False
    if re.search(r"(?:=>|\b(?:const|return|function|document|window|fetch)\b|[{};=<>])", value):
        return False
    if re.fullmatch(r"[\w./:#?&=%+-]+", value):
        return value[0].isupper() and not re.search(r"[a-z][A-Z]", value)
    return True


class PublicCopyParser(HTMLParser):
    def __init__(self, strings):
        super().__init__(convert_charrefs=True)
        self.strings = strings
        self.skip_depth = 0
        self.inline_script = 0
        self.script_text = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in {"script", "style", "noscript"}:
            self.skip_depth += 1
            if tag == "script":
                self.inline_script += 1
        for name in LANGUAGE_ATTRIBUTES:
            value = clean(attrs.get(name) or "")
            if value and looks_translatable(value):
                self.strings.add(value)

    def handle_endtag(self, tag):
        if tag in {"script", "style", "noscript"} and self.skip_depth:
            self.skip_depth -= 1
            if tag == "script" and self.inline_script:
                source = "".join(self.script_text)
                collect_javascript(source, self.strings)
                self.script_text.clear()
                self.inline_script -= 1

    def handle_data(self, data):
        if self.inline_script:
            self.script_text.append(data)
        if self.skip_depth:
            return
        value = clean(data)
        if value and looks_translatable(value):
            self.strings.add(value)


class TemplateCopyParser(HTMLParser):
    def __init__(self, strings):
        super().__init__(convert_charrefs=True)
        self.strings = strings

    def handle_data(self, data):
        value = clean(data)
        if value and looks_translatable(value):
            self.strings.add(value)

    def handle_starttag(self, tag, attrs):
        for name, raw_value in attrs:
            if name not in LANGUAGE_ATTRIBUTES:
                continue
            value = clean(raw_value or "")
            if value and looks_translatable(value):
                self.strings.add(value)


def decode_common_escapes(value):
    return (value.replace(r"\n", " ")
                 .replace(r"\r", " ")
                 .replace(r"\t", " ")
                 .replace(r"\'", "'")
                 .replace(r'\"', '"')
                 .replace(r"\\", "\\"))


def collect_javascript(source, strings):
    index = 0
    while index < len(source):
        if source.startswith("//", index):
            newline = source.find("\n", index + 2)
            index = len(source) if newline < 0 else newline + 1
            continue
        if source.startswith("/*", index):
            close = source.find("*/", index + 2)
            index = len(source) if close < 0 else close + 2
            continue

        quote = source[index]
        if quote not in {"'", '"', "`"}:
            index += 1
            continue

        start = index + 1
        index = start
        escaped = False
        while index < len(source):
            char = source[index]
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                break
            index += 1

        literal = source[start:index]
        if quote == "`":
            template = INTERPOLATION.sub(" ", decode_common_escapes(literal))
            parser = TemplateCopyParser(strings)
            try:
                parser.feed(template)
                parser.close()
            except Exception:
                pass
        else:
            value = clean(decode_common_escapes(literal))
            if value and looks_translatable(value):
                strings.add(value)
        index += 1


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    strings = set()
    for path in PUBLIC.rglob("*.html"):
        if "admin" in path.relative_to(PUBLIC).parts:
            continue
        parser = PublicCopyParser(strings)
        parser.feed(path.read_text(encoding="utf-8"))
        parser.close()

    for path in PUBLIC_JS.rglob("*.js"):
        if "admin" in path.relative_to(PUBLIC_JS).parts:
            continue
        collect_javascript(path.read_text(encoding="utf-8"), strings)

    json.dump(sorted(strings), sys.stdout, ensure_ascii=False, indent=2)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
