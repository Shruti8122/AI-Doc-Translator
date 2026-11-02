import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  FiGlobe,
  FiArrowRight,
  FiBook,
  FiLoader
} from "react-icons/fi";

import GlassCard from "../components/GlassCard";
import { fetchLanguages, startTranslation } from "../api";

export default function LanguagePage() {

  const { taskId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [languages, setLanguages] = useState({});
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("");
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {

    fetchLanguages()
      .then((data) => setLanguages(data))
      .catch(() =>
        setError(t("languages.failedToLoad"))
      );

  }, []);

  const handleStart = async () => {

    if (!targetLang) {

      setError(t("languages.selectTarget"));
      return;

    }

    setStarting(true);
    setError("");

    try {

      const sourceEntry = Object.entries(languages).find(
        ([, value]) => value.easyocr === sourceLang
      );
      const targetEntry = Object.entries(languages).find(
        ([, value]) => value.nllb === targetLang
      );

      await startTranslation(
        taskId,
        sourceEntry ? sourceEntry[1].easyocr : "en",
        targetLang,
        sourceEntry ? sourceEntry[0] : "English",
        targetEntry ? targetEntry[0] : ""
      );

      navigate(`/progress/${taskId}`);

    } catch (err) {

      setError(
        err.response?.data?.error ||
        t("languages.failedToStart")
      );

    } finally {

      setStarting(false);

    }

  };

  const langNames = Object.keys(languages).sort();

  return (

    <div className="page-container">

      <GlassCard>

        <motion.div

          initial={{
            opacity: 0,
            y: -15
          }}

          animate={{
            opacity: 1,
            y: 0
          }}

        >

          <h1 className="title">

            {t("languages.title")}

          </h1>

          <p className="subtitle">

            {t("languages.subtitle")}

          </p>

        </motion.div>

        <div
          style={{
            marginBottom: 25
          }}
        >

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
              fontWeight: 600
            }}
          >

            <FiBook />

            {t("languages.source")}

          </label>

          <select

            className="glass-select"

            value={sourceLang}

            onChange={(e) =>
              setSourceLang(e.target.value)
            }

          >

            {

              langNames.map((name) => (

                <option

                  key={languages[name].easyocr}

                  value={languages[name].easyocr}

                >

                  {name}

                </option>

              ))

            }

          </select>

        </div>

        <div
          style={{
            textAlign: "center",
            marginBottom: 18
          }}
        >

          <FiArrowRight
            size={28}
            color="#A78BFA"
          />

        </div>

        <div>

          <label

            style={{

              display: "flex",

              alignItems: "center",

              gap: 8,

              marginBottom: 10,

              fontWeight: 600

            }}

          >

            <FiGlobe />

            {t("languages.target")}

          </label>

          <select

            className="glass-select"

            value={targetLang}

            onChange={(e) =>
              setTargetLang(e.target.value)
            }

          >

            <option value="">

              {t("languages.select")}

            </option>

            {

              langNames.map((name) => (

                <option

                  key={languages[name].nllb}

                  value={languages[name].nllb}

                >

                  {name}

                </option>

              ))

            }

          </select>

        </div>

        {

          error && (

            <motion.div

              initial={{
                opacity: 0
              }}

              animate={{
                opacity: 1
              }}

              style={{

                marginTop: 15,

                textAlign: "center",

                color: "#F87171",

                fontWeight: 600

              }}

            >

              {error}

            </motion.div>

          )

        }

        <button

          className="glass-button"

          disabled={
            starting || !targetLang
          }

          onClick={handleStart}

          style={{
            marginTop: 28
          }}

        >

          {

            starting ? (

              <>

                <FiLoader
                  style={{
                    marginRight: 10
                  }}
                />

                {t("languages.starting")}

              </>

            ) : (

              t("languages.start")

            )

          }

        </button>

      </GlassCard>

    </div>

  );

}