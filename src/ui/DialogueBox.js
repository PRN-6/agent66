import { RACES } from '../config/constants.js';

export class DialogueBox {
  constructor(onSwitchCharacter) {
    this.onSwitchCharacter = onSwitchCharacter;
    this.currentCharacter = null;
    this.dialogueIndex = 0;
    this.isOpen = false;

    this.initDOM();
  }

  initDOM() {
    this.container = document.createElement('div');
    this.container.className = 'dialogue-modal';
    this.container.style.display = 'none';

    this.container.innerHTML = `
      <div class="dialogue-card">
        <div class="dialogue-header">
          <div class="dialogue-badge" id="dlgBadge">ROLE</div>
          <div class="dialogue-title-box">
            <div class="dialogue-name-row">
              <h2 id="dlgName">Character Name</h2>
              <div class="dialogue-lifespan-pill" id="dlgLifespanPill">
                <span class="dlg-race-badge" id="dlgRaceBadge">👑 Human</span>
                <span class="dlg-disposition-badge" id="dlgDispositionBadge">🏰 Versatile</span>
                <span class="dlg-age" id="dlgAge">Age: 21</span>
                <span class="dlg-lifespan" id="dlgLifespan">⏳ Span: 75–100 Yrs</span>
              </div>
            </div>
            <span id="dlgTitle">Character Title</span>
          </div>
          <button class="btn-close-dlg" id="dlgCloseBtn">✕</button>
        </div>
        <div class="dialogue-body">
          <div class="dialogue-speech" id="dlgSpeech">
            "Dialogue text goes here..."
          </div>
        </div>
        <div class="dialogue-footer">
          <button class="btn-dlg-action btn-next-line" id="dlgNextBtn">Next Line 💬</button>
          <button class="btn-dlg-action btn-switch-char" id="dlgSwitchBtn">Play as this Character ⚡</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    this.container.querySelector('#dlgCloseBtn').addEventListener('click', () => {
      this.close();
    });

    this.container.querySelector('#dlgNextBtn').addEventListener('click', () => {
      this.showNextLine();
    });

    this.container.querySelector('#dlgSwitchBtn').addEventListener('click', () => {
      if (this.currentCharacter && this.onSwitchCharacter) {
        this.onSwitchCharacter(this.currentCharacter.id);
        this.close();
      }
    });

    // Close on Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  open(character) {
    this.currentCharacter = character;
    this.dialogueIndex = 0;
    this.isOpen = true;

    const badgeEl = this.container.querySelector('#dlgBadge');
    const nameEl = this.container.querySelector('#dlgName');
    const titleEl = this.container.querySelector('#dlgTitle');
    const raceBadgeEl = this.container.querySelector('#dlgRaceBadge');
    const dispositionEl = this.container.querySelector('#dlgDispositionBadge');
    const ageEl = this.container.querySelector('#dlgAge');
    const lifespanEl = this.container.querySelector('#dlgLifespan');

    badgeEl.textContent = character.badge;
    badgeEl.style.backgroundColor = character.color;
    nameEl.textContent = character.name;
    nameEl.style.color = character.color;
    titleEl.textContent = character.title;

    // Lifespan & Race information
    const raceKey = character.race || 'human';
    const raceInfo = RACES[raceKey] || RACES.human;

    raceBadgeEl.textContent = `${raceInfo.icon} ${raceInfo.name.split(' ')[0]}`;
    raceBadgeEl.style.color = raceInfo.accentColor || raceInfo.color;

    if (dispositionEl) {
      dispositionEl.textContent = raceInfo.dispositionTag || '';
      dispositionEl.style.color = raceInfo.accentColor || raceInfo.color;
    }

    if (character.age !== undefined && character.age !== null) {
      ageEl.textContent = `Age: ${typeof character.age === 'number' ? character.age.toLocaleString() : character.age}`;
    } else {
      ageEl.textContent = `Age: Mature`;
    }

    lifespanEl.textContent = `⏳ Span: ${character.lifespan || raceInfo.lifespan}`;

    const switchBtn = this.container.querySelector('#dlgSwitchBtn');
    if (character.isPlayable === false) {
      switchBtn.style.display = 'none';
    } else {
      switchBtn.style.display = 'inline-block';
    }

    this.container.style.display = 'flex';
    this.showNextLine();
  }

  showNextLine() {
    if (!this.currentCharacter) return;
    const lines = this.currentCharacter.dialogues;
    if (!lines || lines.length === 0) return;

    const speechEl = this.container.querySelector('#dlgSpeech');
    const currentLine = lines[this.dialogueIndex % lines.length];
    this.dialogueIndex++;

    // Typewriter effect
    speechEl.textContent = '';
    let i = 0;
    clearInterval(this.typeInterval);
    this.typeInterval = setInterval(() => {
      speechEl.textContent += currentLine.charAt(i);
      i++;
      if (i >= currentLine.length) {
        clearInterval(this.typeInterval);
      }
    }, 18);
  }

  close() {
    this.isOpen = false;
    this.container.style.display = 'none';
    clearInterval(this.typeInterval);
  }
}

