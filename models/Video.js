const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "database");
const dataFile = path.join(dataDir, "videos.json");

function ensureStore() {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    if (!fs.existsSync(dataFile)) {
        fs.writeFileSync(dataFile, "[]");
    }
}

function readVideos() {
    ensureStore();

    try {
        return JSON.parse(fs.readFileSync(dataFile, "utf8"));
    } catch (error) {
        return [];
    }
}

function writeVideos(videos) {
    ensureStore();
    fs.writeFileSync(dataFile, JSON.stringify(videos, null, 2));
}

function matchesFilter(video, filter) {
    return Object.entries(filter || {}).every(([key, value]) => {
        if (value === undefined || value === null || value === "") return true;
        return String(video[key]) === String(value);
    });
}

class VideoDocument {
    constructor(data) {
        Object.assign(this, data);
    }

    async save() {
        const videos = readVideos();
        const index = videos.findIndex(video => video._id === this._id);

        if (index >= 0) {
            this.updatedAt = new Date().toISOString();
            videos[index] = { ...this };
            writeVideos(videos);
        }

        return this;
    }

    async deleteOne() {
        const videos = readVideos().filter(video => video._id !== this._id);
        writeVideos(videos);
    }
}

class VideoQuery {
    constructor(filter, single = false) {
        this.filter = filter || {};
        this.single = single;
        this.limitValue = null;
        this.skipValue = 0;
        this.sortValue = null;
    }

    populate() {
        return this;
    }

    sort(value) {
        this.sortValue = value;
        return this;
    }

    limit(value) {
        this.limitValue = Number(value);
        return this;
    }

    skip(value) {
        this.skipValue = Number(value);
        return this;
    }

    exec() {
        let videos = readVideos().filter(video => matchesFilter(video, this.filter));

        if (this.sortValue && this.sortValue.createdAt) {
            const direction = Number(this.sortValue.createdAt);
            videos = videos.sort((a, b) => {
                const left = new Date(a.createdAt || 0).getTime();
                const right = new Date(b.createdAt || 0).getTime();
                return direction < 0 ? right - left : left - right;
            });
        }

        if (this.skipValue) {
            videos = videos.slice(this.skipValue);
        }

        if (this.limitValue) {
            videos = videos.slice(0, this.limitValue);
        }

        if (this.single) {
            const video = videos[0];
            return Promise.resolve(video ? new VideoDocument(video) : null);
        }

        return Promise.resolve(videos.map(video => new VideoDocument(video)));
    }

    then(resolve, reject) {
        return this.exec().then(resolve, reject);
    }

    catch(reject) {
        return this.exec().catch(reject);
    }
}

module.exports = {
    async create(data) {
        const now = new Date().toISOString();
        const video = {
            _id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
            views: 0,
            isActive: true,
            createdAt: now,
            updatedAt: now,
            ...data
        };

        const videos = readVideos();
        videos.push(video);
        writeVideos(videos);

        return new VideoDocument(video);
    },

    find(filter) {
        return new VideoQuery(filter);
    },

    findById(id) {
        return new VideoQuery({ _id: id }, true);
    },

    async countDocuments(filter) {
        return readVideos().filter(video => matchesFilter(video, filter)).length;
    }
};
