"use client";

import type { ReactNode } from "react";
import {
  Camera,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";

type MotoCarsDocumentoLayoutProps = {
  titulo: string;
  numero?: string | number | null;
  fecha?: string;
  children: ReactNode;
};

export default function MotoCarsDocumentoLayout({
  titulo,
  numero,
  fecha,
  children,
}: MotoCarsDocumentoLayoutProps) {
  return (
    <main className="documento-motocars">
      <div
        className="documento-marca-agua"
        aria-hidden="true"
      >
        <img
          src="/logos/motocars-Isotipo-rojo.png"
          alt=""
        />
      </div>

      <header className="documento-encabezado">
        <div className="documento-marca">
          <div className="documento-nombre-marca">
            MotoCars
            <span>CONCESIONARIA</span>
          </div>

          <div className="documento-empresa">
            <div>
              <MapPin
                size={13}
                strokeWidth={1.8}
              />
              <span>
                Primeros Pobladores 1400,
                Neuquén Capital
              </span>
            </div>

            <div>
              <MessageCircle
                size={13}
                strokeWidth={1.8}
              />
              <span>
                WhatsApp: +54 9 299 513 3023
              </span>
            </div>

            <div>
              <Mail
                size={13}
                strokeWidth={1.8}
              />
              <span>
                motocars.concesionaria@gmail.com
              </span>
            </div>

            <div>
              <Camera
                size={13}
                strokeWidth={1.8}
              />
              <span>
                @motocars.concesionaria
              </span>
            </div>
          </div>
        </div>

        <div className="documento-identificacion">
          <h1>{titulo}</h1>

          {numero !== undefined &&
            numero !== null && (
              <div className="documento-numero">
                N.º {numero}
              </div>
            )}

          {fecha && (
            <div className="documento-fecha">
              Fecha: {fecha}
            </div>
          )}
        </div>
      </header>

      <div className="documento-contenido">
        {children}
      </div>

      <footer className="documento-pie">
        <div className="pie-item pie-item-izquierda">
          <MapPin
            size={14}
            strokeWidth={1.8}
          />
          <span>
            Primeros Pobladores 1400
            <br />
            Neuquén Capital
          </span>
        </div>

        <div className="pie-item">
          <MessageCircle
            size={14}
            strokeWidth={1.8}
          />
          <span>
            WhatsApp
            <br />
            +54 9 299 513 3023
          </span>
        </div>

        <div className="pie-item">
          <Mail
            size={14}
            strokeWidth={1.8}
          />
          <span>
            motocars.concesionaria@gmail.com
          </span>
        </div>

        <div className="pie-item pie-item-derecha">
          <Camera
            size={14}
            strokeWidth={1.8}
          />
          <span>
            @motocars.concesionaria
          </span>
        </div>
      </footer>

      <style jsx global>{`
        .documento-motocars {
          position: relative;
          overflow: hidden;

          width: 210mm;
          min-height: 297mm;

          margin: 0 auto 32px;
          padding: 14mm 16mm 12mm;

          background: #ffffff;
          color: #171717;

          font-family: Arial, Helvetica, sans-serif;

          box-sizing: border-box;

          display: flex;
          flex-direction: column;
        }

        .documento-marca-agua {
          position: absolute;

          left: 50%;
          top: 54%;

          transform: translate(
            -50%,
            -50%
          );

          width: 100mm;

          opacity: 0.055;

          pointer-events: none;

          z-index: 0;
        }

        .documento-marca-agua img {
          display: block;

          width: 100%;
          height: auto;

          object-fit: contain;
        }

        .documento-encabezado,
        .documento-contenido,
        .documento-pie {
          position: relative;
          z-index: 1;
        }

        .documento-encabezado {
          display: flex;

          justify-content: space-between;
          align-items: flex-start;

          gap: 24px;

          padding-bottom: 14px;

          border-bottom: 3px solid #111827;
        }

        .documento-marca {
          flex: 1;
          min-width: 0;
        }

        .documento-nombre-marca {
          font-size: 27px;
          line-height: 1;

          font-weight: 900;

          letter-spacing: -1px;

          color: #111827;
        }

        .documento-nombre-marca span {
          display: block;

          margin-top: 5px;

          font-size: 9px;
          line-height: 1;

          font-weight: 700;

          letter-spacing: 3px;
        }

        .documento-empresa {
          display: flex;
          flex-direction: column;

          gap: 5px;

          margin-top: 13px;

          font-size: 10.5px;
          line-height: 1.35;
        }

        .documento-empresa > div {
          display: flex;

          align-items: center;

          gap: 7px;
        }

        .documento-empresa svg {
          flex: 0 0 auto;
        }

        .documento-identificacion {
          width: 92mm;

          padding-top: 4px;

          text-align: right;
        }

        .documento-identificacion h1 {
          margin: 0;

          font-size: 21px;
          line-height: 1.15;

          font-weight: 800;

          text-transform: uppercase;
        }

        .documento-numero {
          margin-top: 9px;

          font-size: 13px;

          font-weight: 700;
        }

        .documento-fecha {
          margin-top: 5px;

          font-size: 11px;
        }

        .documento-contenido {
          flex: 1;
        }

        .documento-pie {
          width: 100%;

          margin-top: 18px;

          padding-top: 10px;

          border-top: 1px solid #bdbdbd;

          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(0, 1fr)
            );

          align-items: center;

          column-gap: 14px;

          font-size: 9px;
          line-height: 1.3;

          color: #3f3f46;
        }

        .pie-item {
          min-width: 0;

          display: flex;

          align-items: center;
          justify-content: center;

          gap: 7px;

          text-align: left;
        }

        .pie-item svg {
          flex: 0 0 auto;
        }

        .pie-item span {
          min-width: 0;
        }

        .pie-item-izquierda {
          justify-content: flex-start;
        }

        .pie-item-derecha {
          justify-content: flex-end;

          text-align: right;
        }

        @page {
          size: A4;
          margin: 0;
        }

        @media print {
  html,
  body {
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
  }

  body * {
    visibility: hidden !important;
  }

  .documento-motocars,
  .documento-motocars * {
    visibility: visible !important;
  }

  .documento-motocars {
    position: absolute;
    left: 0;
    top: 0;

    width: 210mm;
    min-height: 297mm;

    margin: 0 !important;
    padding: 14mm 16mm 12mm;

    box-shadow: none !important;

    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .documento-marca-agua {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .no-imprimir {
    display: none !important;
  }
}

        @media screen and (max-width: 850px) {
          .documento-motocars {
            width: calc(100% - 24px);

            min-height: auto;

            padding: 24px;
          }

          .documento-encabezado {
            flex-direction: column;
          }

          .documento-identificacion {
            width: 100%;

            text-align: left;
          }

          .documento-pie {
            grid-template-columns:
              1fr
              1fr;

            row-gap: 12px;
          }

          .pie-item,
          .pie-item-izquierda,
          .pie-item-derecha {
            justify-content: flex-start;

            text-align: left;
          }

          .documento-marca-agua {
            width: 70%;
          }
        }
      `}</style>
    </main>
  );
}