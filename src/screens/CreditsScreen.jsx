// ARQUIVO: src/screens/CreditsScreen.jsx  (SUBSTITUIR o conteúdo inteiro)
import { useEffect, useRef, useState } from "react";

import Backdrop from "../components/Backdrop.jsx";
import Button from "../components/Button.jsx";
import {
  CREDITS_INTRO,
  CREDITS_SECTIONS,
  CREDITS_TITLE,
  SHOW_RGM,
  TEAM,
  UNIVERSITY
} from "../data/credits.js";
import "../styles/credits.css";

/**
 * Tela de Créditos: universidade, integrantes e tecnologias.
 * onBack() volta ao menu principal.
 */
export default function CreditsScreen({ onBack }) {
  const titleRef = useRef(null);
  const [logoFailed, setLogoFailed] = useState(false);

  // Leitores de tela começam pelo título.
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const sections = CREDITS_SECTIONS.filter(section => section.items.length > 0);

  return (
    <div className="screen">
      <Backdrop />

      <div className="credits">
        <header className="credits__header">
          <h1 className="credits__title" ref={titleRef} tabIndex={-1}>
            Créditos
          </h1>
          <p className="credits__subtitle">{CREDITS_TITLE}</p>
          <p className="credits__intro">{CREDITS_INTRO}</p>
        </header>

        <section className="panel team" aria-labelledby="team-heading">
          {UNIVERSITY.logo && !logoFailed ? (
            <img
              className={
                UNIVERSITY.logoTrim ? "team__logo team__logo--trim" : "team__logo"
              }
              src={UNIVERSITY.logo}
              alt={`Logotipo da ${UNIVERSITY.name}`}
              onError={() => setLogoFailed(true)}
            />
          ) : null}

          <h2 id="team-heading" className="panel__title">
            {UNIVERSITY.name} ({UNIVERSITY.short})
          </h2>
          <p className="team__text">{UNIVERSITY.description}</p>

          <h3 className="team__subtitle">Integrantes</h3>
          <ul className="team__list">
            {TEAM.map(member => (
              <li key={member.rgm} className="team__member">
                <span className="team__name">{member.name}</span>
                {SHOW_RGM ? (
                  <span className="team__rgm">RGM {member.rgm}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <div className="credits__grid">
          {sections.map(section => (
            <section
              key={section.id}
              className="panel"
              aria-labelledby={`credits-${section.id}`}
            >
              <h2 id={`credits-${section.id}`} className="panel__title">
                {section.title}
              </h2>

              <dl className="credits__list">
                {section.items.map(item => (
                  <div key={`${item.role}-${item.name}`} className="credits__item">
                    <dt>{item.role}</dt>
                    <dd>{item.name}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <div className="credits__footer">
          <Button variant="secondary" size="md" icon="🏠" onClick={onBack}>
            Voltar ao menu
          </Button>
        </div>
      </div>
    </div>
  );
}