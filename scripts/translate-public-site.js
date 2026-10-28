require("dotenv").config();

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const projectRoot = path.join(__dirname, "..");
const outputDir = path.join(projectRoot, "public", "i18n");
const locales = [
    { code: "fr", name: "French" },
    { code: "sw", name: "Swahili" },
    { code: "es", name: "Spanish" },
    { code: "pa", name: "Punjabi" },
    { code: "zh", name: "Simplified Chinese" }
];
const batchCharacterLimit = 6500;

function extractStrings() {
    const python = process.env.PYTHON || "python";
    const result = spawnSync(
        python,
        [path.join(__dirname, "extract-public-translation-strings.py")],
        { cwd: projectRoot, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }
    );

    if (result.error) throw result.error;
    if (result.status !== 0) {
        throw new Error(result.stderr || "Unable to extract website copy.");
    }

    return JSON.parse(result.stdout);
}

function makeBatches(strings) {
    const batches = [];
    let current = [];
    let characters = 0;

    for (const text of strings) {
        if (current.length && characters + text.length > batchCharacterLimit) {
            batches.push(current);
            current = [];
            characters = 0;
        }
        current.push(text);
        characters += text.length;
    }
    if (current.length) batches.push(current);
    return batches;
}

async function translateBatch(client, locale, batch) {
    const source = Object.fromEntries(batch.map((text, index) => [String(index), text]));
    const response = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
            {
                role: "system",
                content: `Translate each website text value from English to ${locale.name}. Return only a JSON object with exactly the same numeric keys and translated string values. Preserve meaning, tone, punctuation, HTML entities, product codes, URLs, currency values, and placeholders. Keep the brand name Klein Shoppers unchanged. Use natural, customer-friendly ${locale.name}.`
            },
            {
                role: "user",
                content: JSON.stringify(source)
            }
        ]
    });

    const translated = JSON.parse(response.choices[0].message.content || "{}");
    return batch.map((text, index) => {
        const value = translated[String(index)];
        if (typeof value !== "string" || !value.trim()) {
            throw new Error(`Missing ${locale.code} translation for item ${index + 1}.`);
        }
        return [text, value.trim()];
    });
}

async function main() {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY must be configured in the project .env file.");
    }

    const strings = extractStrings();
    const batches = makeBatches(strings);
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    fs.mkdirSync(outputDir, { recursive: true });

    console.log(`Generating ${locales.length} locale files for ${strings.length} website strings in ${batches.length} batches each.`);

    for (const locale of locales) {
        const translations = {};
        for (let index = 0; index < batches.length; index += 1) {
            console.log(`${locale.name}: batch ${index + 1}/${batches.length}`);
            const entries = await translateBatch(client, locale, batches[index]);
            Object.assign(translations, Object.fromEntries(entries));
        }

        const destination = path.join(outputDir, `${locale.code}.json`);
        fs.writeFileSync(destination, `${JSON.stringify(translations, null, 2)}\n`, "utf8");
    }

    console.log(`Wrote ${locales.length} translation files to ${path.relative(projectRoot, outputDir)}.`);
}

main().catch(error => {
    console.error(error.message || error);
    process.exitCode = 1;
});
