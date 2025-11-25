import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { uploadToIPFS } from "./lib/ipfs";
import { storeOnBlockchain } from "./lib/blockchain";
import { generateHash } from "./lib/hash";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // GET /api/records - Fetch all verified news records
  app.get("/api/records", async (_req, res) => {
    try {
      const records = await storage.getAllRecords();
      res.json(records);
    } catch (error) {
      console.error("Error fetching records:", error);
      res.status(500).json({ 
        error: "Failed to fetch records",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // POST /api/upload - Upload news with media file
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      const { text } = req.body;
      const file = req.file;

      if (!text || !file) {
        return res.status(400).json({ 
          error: "Missing required fields",
          message: "Both text and file are required"
        });
      }

      // 1. Upload file to IPFS
      const cid = await uploadToIPFS(file.buffer, file.originalname);
      
      // 2. Generate timestamp (will be used for both hashing and database)
      const timestamp = new Date().toISOString();
      
      // 3. Generate SHA-256 hash
      const hash = generateHash(text, cid, timestamp);
      
      // 4. Store on blockchain (MANDATORY - core requirement)
      const txHash = await storeOnBlockchain(hash, cid);
      console.log('✅ Blockchain verification successful:', txHash);
      
      // 5. Save to database with the exact timestamp string used in hashing
      const record = await storage.createRecord({
        text,
        cid,
        hash,
        tx: txHash,
        fileName: file.originalname,
        fileType: file.mimetype,
        timestamp, // ISO string used in hash generation
      });

      res.json({
        success: true,
        hash,
        cid,
        txHash,
        record,
      });
      
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ 
        error: "Upload failed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
