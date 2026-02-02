import express from "express";
import compression from "compression";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = Number.parseInt(process.env.PORT || "8080", 10);

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(compression());
app.disable("x-powered-by");

const oneDayMs = 24 * 60 * 60 * 1000;
app.use(
  express.static("public", {
    maxAge: oneDayMs,
    setHeaders: (res, path) => {
      if (path.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  })
);

const config = {
  whatsappNumber: process.env.WHATSAPP_NUMBER || "",
  heroVideoUrl: process.env.HERO_VIDEO_URL || "",
  heroPosterUrl: process.env.HERO_POSTER_URL || "",
  financingVideoUrl: process.env.FINANCING_VIDEO_URL || "",
  financingPosterUrl: process.env.FINANCING_POSTER_URL || "",
  projectsVideoUrl: process.env.PROJECTS_VIDEO_URL || "",
  projectsPosterUrl: process.env.PROJECTS_POSTER_URL || "",
};

app.get("/api/config", (_req, res) => {
  res.json(config);
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

const cloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  apiKey: process.env.CLOUDINARY_API_KEY || "",
  apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  folder: process.env.CLOUDINARY_FOLDER || "",
};

const cache = {
  data: [],
  fetchedAt: 0,
};

const ttlSeconds = Number.parseInt(process.env.GALLERY_CACHE_TTL_SECONDS || "300", 10);

const buildAuthHeader = () => {
  const authString = `${cloudinaryConfig.apiKey}:${cloudinaryConfig.apiSecret}`;
  return `Basic ${Buffer.from(authString).toString("base64")}`;
};

const buildThumbUrl = ({ resourceType, publicId, format }) => {
  const base = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/${resourceType}/upload`;
  if (resourceType === "video") {
    return `${base}/so_0,c_fill,w_480,h_360,q_auto,f_auto/${publicId}.jpg`;
  }
  return `${base}/c_fill,w_480,h_360,q_auto,f_auto/${publicId}.${format}`;
};

const mapResource = (resource) => {
  const resourceType = resource.resource_type || "image";
  return {
    id: resource.asset_id || resource.public_id,
    type: resourceType,
    title: (resource.context && resource.context.custom && resource.context.custom.caption) || resource.public_id,
    src: resource.secure_url,
    thumb: buildThumbUrl({
      resourceType,
      publicId: resource.public_id,
      format: resource.format,
    }),
    width: resource.width,
    height: resource.height,
    createdAt: resource.created_at,
    tags: resource.tags || [],
  };
};

const fetchCloudinaryResources = async (resourceType) => {
  const { cloudName, folder } = cloudinaryConfig;
  if (!cloudName || !cloudinaryConfig.apiKey || !cloudinaryConfig.apiSecret || !folder) {
    return [];
  }

  const url = new URL(`https://api.cloudinary.com/v1_1/${cloudName}/resources/${resourceType}/upload`);
  url.searchParams.set("prefix", folder);
  url.searchParams.set("max_results", "200");
  url.searchParams.set("context", "true");
  url.searchParams.set("tags", "true");

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: buildAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(`Cloudinary ${resourceType} fetch failed: ${response.status}`);
  }

  const payload = await response.json();
  return (payload.resources || []).map(mapResource);
};

app.get("/api/gallery", async (_req, res) => {
  const now = Date.now();
  const isFresh = cache.data.length && now - cache.fetchedAt < ttlSeconds * 1000;
  if (isFresh) {
    res.json(cache.data);
    return;
  }

  try {
    const [images, videos] = await Promise.all([
      fetchCloudinaryResources("image"),
      fetchCloudinaryResources("video"),
    ]);
    const merged = [...images, ...videos].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    cache.data = merged;
    cache.fetchedAt = now;
    res.json(merged);
  } catch (error) {
    if (cache.data.length) {
      res.json(cache.data);
      return;
    }
    res.json([]);
  }
});

app.get("*", (_req, res) => {
  res.sendFile(new URL("./public/index.html", import.meta.url).pathname);
});

app.listen(port, () => {
  console.log(`Island Force Renewables running on ${port}`);
});
