import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import {
  FiUploadCloud,
  FiFileText,
  FiCheckCircle,
  FiGlobe,
  FiCpu,
} from "react-icons/fi";
import GlassCard from "../components/GlassCard";
import { uploadFile } from "../api";

export default function UploadPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const onDrop = useCallback((accepted) => {
    const f = accepted[0];

    if (f && f.type === "application/pdf") {
      setFile(f);
      setError("");
    } else {
      setError(t("upload.invalidFile"));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const { task_id } = await uploadFile(file);
      navigate(`/language/${task_id}`);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        t("upload.failed")
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-container">

      <GlassCard className="upload-card">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >

          <h1 className="title">
            {t("upload.title")}
          </h1>

          <p className="subtitle">
            {t("upload.subtitle")}
          </p>

        </motion.div>

        <motion.div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? "active" : ""}`}
          whileHover={{ scale: 1.01 }}
        >

          <input {...getInputProps()} />

          <FiUploadCloud
            size={70}
            style={{
              marginBottom: 20,
              color: "#A78BFA",
            }}
          />

          <h3
            style={{
              marginBottom: 10,
            }}
          >
            {isDragActive
              ? t("upload.dropActive")
              : t("upload.dropInactive")}
          </h3>

          <p
            style={{
              color: "rgba(255,255,255,.65)",
            }}
          >
            {t("upload.browse")}
          </p>

          <small
            style={{
              display: "block",
              marginTop: 12,
              color: "rgba(255,255,255,.45)",
            }}
          >
            {t("upload.supports")}
          </small>

        </motion.div>

        {file && (

          <motion.div
            className="file-info"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >

            <FiFileText
              size={28}
              color="#A78BFA"
            />

            <div>

              <strong>{file.name}</strong>

              <br />

              <span
                style={{
                  color: "rgba(255,255,255,.55)",
                }}
              >
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>

            </div>

            <FiCheckCircle
              size={24}
              color="#4ADE80"
              style={{
                marginLeft: "auto",
              }}
            />

          </motion.div>

        )}

        {error && (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              color: "#F87171",
              textAlign: "center",
              marginTop: 18,
            }}
          >
            {error}
          </motion.div>

        )}

        <button
          className="glass-button"
          disabled={!file || uploading}
          onClick={handleUpload}
          style={{
            marginTop: 30,
          }}
        >
          {uploading
                          ? t("upload.uploading")
            : t("upload.continue")}
        </button>

        <div
          style={{
            marginTop: 40,
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 16,
            textAlign: "center",
          }}
        >

          <div>

            <FiCpu
              size={26}
              color="#A78BFA"
            />

            <p>{t("upload.ocr")}</p>

          </div>

          <div>

            <FiGlobe
              size={26}
              color="#60A5FA"
            />

            <p>{t("upload.languages")}</p>

          </div>

          <div>

            <FiCheckCircle
              size={26}
              color="#4ADE80"
            />

            <p>{t("upload.aiTranslation")}</p>

          </div>

        </div>

      </GlassCard>

    </div>
  );
}