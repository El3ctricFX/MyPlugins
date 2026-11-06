selah.registerCategoryType({
    id: "flowtide",
    label: "Flowtide",
    icon: "🌸",
    description: "Focus & Hide Tasks workspace",
    layout: "full", // <--- Takes over the whole window!
    render: (container, ctx) => {
        container.innerHTML = "";

        const style = document.createElement("style");
        style.textContent = `
        .flowtide-plugin {
            display: block; width: 100%; height: 100%; overflow-y: auto;
            font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
            background: var(--c-bg);
            color: var(--c-text);
            padding: 2rem 4rem;
            line-height: normal; font-size: 16px; box-sizing: border-box;
        }
        .flowtide-plugin *, .flowtide-plugin *::before, .flowtide-plugin *::after { margin: 0; padding: 0; box-sizing: border-box; }

        /* Map Flowtide variables directly to Selah's Theme Variables */
        .flowtide-plugin {
            --text-primary: var(--c-text);
            --text-secondary: var(--c-text-muted);
            --text-muted: var(--c-text-dim);
            --text-light: var(--c-text-dim);
            --card-bg: var(--c-surface);
            --card-border: var(--c-border);
            --card-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            --card-shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.15);
            --input-bg: var(--c-surface-alt);
            --input-border: var(--c-border-light);
            --input-focus: var(--c-accent);
            --priority-group-bg: var(--c-surface-alt);
            --priority-btn-color: var(--c-text-muted);
            --chip-bg: var(--c-surface-alt);
            --chip-text: var(--c-text-muted);
            --modal-header-bg: var(--c-surface-alt);
            --modal-border: var(--c-border);
            --json-editor-bg: var(--c-bg);
            --json-editor-text: var(--c-text);
            --empty-bg: var(--c-surface-alt);
            --empty-text: var(--c-text-muted);
            --toast-bg: var(--c-surface);
            --toast-text: var(--c-text);
            --menu-bg: var(--c-surface);
            --menu-border: var(--c-border);
            --menu-item-hover: var(--c-surface-alt);
            --card-selected-bg: var(--c-surface);
            --card-selected-border: var(--c-accent);
            --scrollbar-thumb: var(--c-border-light);
            --scrollbar-thumb-hover: var(--c-border-lighter);
            --note-bg: var(--c-surface-alt);
            --note-border: var(--c-border);
            --edit-input-border: var(--c-accent);
            --edit-input-bg: var(--c-surface);
            --toggle-bg: var(--c-surface-alt);
            --toggle-border: var(--c-border);
            --toggle-active-bg: var(--c-accent);
            --toggle-active-text: var(--c-bg);
            --icon-btn-hover: var(--c-surface-alt);
            --del-btn-hover: rgba(220, 38, 38, 0.1);
            --del-btn-color: #dc2626;
            --hide-btn-hover: rgba(245, 158, 11, 0.1);
            --hide-btn-color: #f59e0b;
            --note-btn-hover: rgba(59, 130, 246, 0.1);
            --note-btn-color: #3b82f6;
            --brand-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            --complete-date: var(--c-text-dim);
            --hidden-badge-bg: var(--c-border);
            --hidden-badge-text: var(--c-text-muted);
            --fake-check-bg: var(--c-surface);
            --fake-check-border: var(--c-border-light);
            --fake-check-hover-bg: var(--c-surface-alt);
            --fake-check-hover-border: var(--c-accent);
            --fake-check-complete-bg: var(--c-accent);
            --fake-check-complete-border: var(--c-accent);
            --title-gradient-1: var(--c-text);
            --title-gradient-2: var(--c-text);
            --header-icon-bg: var(--c-surface-alt);
            --header-icon-color: var(--c-accent);
            --add-btn-bg: var(--c-accent);
            --add-btn-hover: var(--c-accent-hover);
            --priority-high: #ef4444;
            --priority-med: #f59e0b;
            --priority-low: #10b981;
            --dropdown-brand-text: var(--c-text);
            --dropdown-brand-icon: var(--c-accent);
            --dropdown-divider: var(--c-border);
        }

        .flowtide-plugin .app-container { max-width: 1100px; width: 100%; margin: 0 auto; display: flex; flex-direction: column; min-height: 100%; }
        .flowtide-plugin .header-flex { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; flex-shrink: 0; }
        .flowtide-plugin .brand-area { display: flex; align-items: center; gap: 1rem; cursor: pointer; transition: all 0.25s ease; }
        .flowtide-plugin .brand-area:hover { transform: scale(1.02); }
        .flowtide-plugin .icon-badge { background: var(--header-icon-bg); width: 52px; height: 52px; border-radius: 28px; display: flex; align-items: center; justify-content: center; font-size: 1.9rem; font-weight: 700; color: var(--header-icon-color); box-shadow: var(--brand-shadow); }
        .flowtide-plugin .title-group h1 { font-size: 2rem; font-weight: 800; letter-spacing: -0.02em; color: var(--title-gradient-1); }
        .flowtide-plugin .right-stats { display: flex; align-items: center; gap: 0.8rem; }
        .flowtide-plugin .toggle-group { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
        .flowtide-plugin .show-hidden-toggle { background: var(--toggle-bg); border: 1px solid var(--toggle-border); border-radius: 40px; padding: 0.3rem 1rem; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s; color: var(--text-secondary); }
        .flowtide-plugin .show-hidden-toggle.active { background: var(--toggle-active-bg); border-color: var(--toggle-active-bg); color: var(--toggle-active-text); }
        .flowtide-plugin .json-modal-btn { background: var(--toggle-bg); border: 1px solid var(--toggle-border); border-radius: 40px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; cursor: pointer; transition: all 0.2s; color: var(--text-secondary); }
        .flowtide-plugin .json-modal-btn:hover { border-color: var(--input-focus); }
        .flowtide-plugin .header-menu-wrap { position: relative; }
        .flowtide-plugin .header-menu { position: absolute; top: calc(100% + 8px); right: 0; background: var(--menu-bg); border-radius: 1.2rem; box-shadow: var(--card-shadow-hover); border: 1px solid var(--menu-border); padding: 0.6rem 0.5rem; display: none; flex-direction: column; gap: 0.2rem; min-width: 220px; z-index: 20; }
        .flowtide-plugin .header-menu.open { display: flex; }
        .flowtide-plugin .dropdown-brand { display: flex; align-items: center; gap: 0.6rem; padding: 0.3rem 0.7rem 0.5rem 0.7rem; border-bottom: 1px solid var(--dropdown-divider); margin-bottom: 0.2rem; cursor: default; }
        .flowtide-plugin .dropdown-brand .brand-icon { font-size: 1.6rem; line-height: 1; }
        .flowtide-plugin .dropdown-brand .brand-name { font-weight: 700; font-size: 1rem; color: var(--dropdown-brand-text); }
        .flowtide-plugin .header-menu-item { background: transparent; border: none; text-align: left; padding: 0.5rem 0.7rem; border-radius: 0.7rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.7rem; color: var(--text-secondary); transition: background 0.15s; width: 100%; }
        .flowtide-plugin .header-menu-item:hover { background: var(--menu-item-hover); }
        .flowtide-plugin .header-menu-item svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; }
        .flowtide-plugin .zoom-control { display: flex; align-items: center; gap: 0.5rem; background: var(--toggle-bg); border: 1px solid var(--toggle-border); border-radius: 40px; padding: 0.3rem 0.9rem; }
        .flowtide-plugin .zoom-control span { font-size: 0.9rem; line-height: 1; color: var(--text-secondary); }
        .flowtide-plugin .zoom-control input[type="range"] { width: 90px; accent-color: var(--input-focus); cursor: pointer; background: transparent; }
        .flowtide-plugin .zoom-label { font-size: 0.7rem; font-weight: 700; color: var(--input-focus); min-width: 2.4em; text-align: right; }
        .flowtide-plugin .input-card-modern { background: var(--input-bg); border-radius: 1.4rem; padding: 0.35rem; display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem; margin-bottom: 1.25rem; border: 1px solid var(--card-border); }
        .flowtide-plugin .input-card-modern input { flex: 2; min-width: 160px; background: transparent; border: none; padding: 0.55rem 0.7rem; font-size: 0.85rem; font-weight: 500; outline: none; color: var(--text-primary); }
        .flowtide-plugin .input-card-modern input::placeholder { color: var(--text-light); font-weight: 400; }
        .flowtide-plugin .priority-group { display: flex; gap: 0.3rem; background: var(--priority-group-bg); padding: 0.2rem; border-radius: 3rem; }
        .flowtide-plugin .priority-btn { border: none; background: transparent; width: 2rem; height: 2rem; border-radius: 2rem; font-weight: 700; font-size: 1rem; cursor: pointer; color: var(--priority-btn-color); display: flex; align-items: center; justify-content: center; }
        .flowtide-plugin .priority-btn.active { background: var(--card-bg); box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04); color: var(--input-focus); }
        .flowtide-plugin .priority-btn[data-prio="High"]:hover { color: var(--priority-high); }
        .flowtide-plugin .priority-btn[data-prio="Med"]:hover { color: var(--priority-med); }
        .flowtide-plugin .priority-btn[data-prio="Low"]:hover { color: var(--priority-low); }
        .flowtide-plugin .add-circle { background: var(--add-btn-bg); border: none; width: 34px; height: 34px; border-radius: 1.4rem; font-size: 1.2rem; font-weight: 400; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
        .flowtide-plugin .add-circle:hover { background: var(--add-btn-hover); transform: scale(0.96); }
        .flowtide-plugin .task-feed { display: flex; flex-direction: column; gap: 0.8em; font-size: calc(14px * var(--task-zoom, 1)); padding-right: 0.5rem; padding-bottom: 250px; }
        .flowtide-plugin .task-card-new { background: var(--card-bg); border-radius: 1.371em; padding: 0.686em 1.029em; display: flex; align-items: center; gap: 0.8em; border: 1px solid var(--card-border); box-shadow: var(--card-shadow); cursor: pointer; position: relative; font-size: 1em; z-index: 1; }
        .flowtide-plugin .task-card-new.selected { border-color: var(--card-selected-border); background: var(--card-selected-bg); box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); transform: scale(1.01); z-index: 30; }
        .flowtide-plugin .task-card-new:hover { border-color: var(--scrollbar-thumb); box-shadow: var(--card-shadow-hover); transform: translateY(-1px); }
        .flowtide-plugin .check-wrapper { cursor: pointer; flex-shrink: 0; padding: 0.143em; }
        .flowtide-plugin .fake-check { width: 1.571em; height: 1.571em; background: var(--fake-check-bg); border-radius: 0.643em; display: flex; align-items: center; justify-content: center; border: 2px solid var(--fake-check-border); }
        .flowtide-plugin .task-card-new:hover .fake-check { border-color: var(--fake-check-hover-border); background: var(--fake-check-hover-bg); }
        .flowtide-plugin .task-card-new.completed .fake-check, .flowtide-plugin .task-card-new.completed:hover .fake-check { background: var(--fake-check-complete-bg); border-color: var(--fake-check-complete-border); }
        .flowtide-plugin .fake-check::after { content: "✓"; font-size: 0.857em; font-weight: 800; color: var(--c-bg); display: none; }
        .flowtide-plugin .task-card-new.completed .fake-check::after { display: block; }
        .flowtide-plugin .task-content { flex: 1; min-width: 0; }
        .flowtide-plugin .task-title { font-weight: 700; font-size: 0.971em; color: var(--text-primary); word-break: break-word; }
        .flowtide-plugin .task-card-new.completed .task-title { text-decoration: line-through; color: var(--text-light); }
        .flowtide-plugin .task-meta-line { display: flex; flex-wrap: wrap; gap: 0.457em; margin-top: 0.286em; align-items: center; }
        .flowtide-plugin .priority-chip { display: inline-flex; align-items: center; gap: 0.35em; font-size: 0.7em; font-weight: 600; color: var(--text-secondary); }
        .flowtide-plugin .priority-chip::before { content: ""; width: 0.55em; height: 0.55em; border-radius: 50%; flex-shrink: 0; }
        .flowtide-plugin .priority-High::before { background: var(--priority-high); }
        .flowtide-plugin .priority-Med::before { background: var(--priority-med); }
        .flowtide-plugin .priority-Low::before { background: var(--priority-low); }
        .flowtide-plugin .complete-date { font-size: 0.686em; color: var(--complete-date); font-weight: 500; }
        .flowtide-plugin .task-note { margin-top: 0.4em; font-size: 0.777em; color: var(--chip-text); background: var(--chip-bg); padding: 0.229em 0.571em; border-radius: 0.714em; display: inline-block; max-width: 100%; word-break: break-word; font-style: italic; }
        .flowtide-plugin .action-group { display: flex; gap: 0.343em; align-items: center; opacity: 0; transform: translateX(8px); transition: opacity 0.2s ease, transform 0.2s ease; pointer-events: none; }
        .flowtide-plugin .task-card-new.selected .action-group { opacity: 1; transform: translateX(0); pointer-events: auto; }
        .flowtide-plugin .icon-btn { background: transparent; border: none; width: 1.857em; height: 1.857em; border-radius: 0.714em; font-size: 1.029em; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; color: var(--text-secondary); }
        .flowtide-plugin .icon-btn.edit-btn:hover { background: var(--icon-btn-hover); color: var(--input-focus); }
        .flowtide-plugin .icon-btn.del-btn:hover { background: var(--del-btn-hover); color: var(--del-btn-color); }
        .flowtide-plugin .icon-btn.note-btn:hover { background: var(--note-btn-hover); color: var(--note-btn-color); }
        .flowtide-plugin .icon-btn.hide-btn:hover { background: var(--hide-btn-hover); color: var(--hide-btn-color); }
        .flowtide-plugin .card-menu { position: absolute; top: calc(100% + 0.4em); right: 0; background: var(--menu-bg); border-radius: 0.9em; box-shadow: var(--card-shadow-hover); border: 1px solid var(--menu-border); padding: 0.3em; display: none; flex-direction: column; gap: 0.1em; min-width: 9.5em; z-index: 5; font-size: 1em; }
        .flowtide-plugin .card-menu.open { display: flex; }
        .flowtide-plugin .menu-item { background: transparent; border: none; text-align: left; padding: 0.45em 0.6em; border-radius: 0.6em; font-size: 0.8em; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5em; color: var(--text-secondary); }
        .flowtide-plugin .menu-item:hover { background: var(--menu-item-hover); color: var(--input-focus); }
        .flowtide-plugin .menu-item.del-btn:hover { background: var(--del-btn-hover); color: var(--del-btn-color); }
        .flowtide-plugin .menu-item.hide-btn:hover { background: var(--hide-btn-hover); color: var(--hide-btn-color); }
        .flowtide-plugin .empty-whimsy { text-align: center; background: var(--empty-bg); border-radius: 1.4rem; padding: 1.75rem 1.25rem; color: var(--empty-text); font-weight: 600; font-size: 0.85rem; }
        .flowtide-plugin .hidden-badge { font-size: 0.65rem; background: var(--hidden-badge-bg); padding: 2px 8px; border-radius: 20px; color: var(--hidden-badge-text); }
        .flowtide-plugin .modal-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; visibility: hidden; opacity: 0; transition: visibility 0.2s, opacity 0.2s; }
        .flowtide-plugin .modal-overlay.active { visibility: visible; opacity: 1; }
        .flowtide-plugin .modal-container { background: var(--card-bg); width: 90%; max-width: 650px; border-radius: 2rem; box-shadow: var(--card-shadow-hover); overflow: hidden; }
        .flowtide-plugin .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.2rem 1.8rem; background: var(--modal-header-bg); border-bottom: 1px solid var(--modal-border); }
        .flowtide-plugin .modal-header h3 { font-weight: 800; color: var(--text-primary); display: flex; gap: 0.5rem; align-items: center; }
        .flowtide-plugin .close-modal { background: none; border: none; font-size: 1.6rem; cursor: pointer; color: var(--text-light); }
        .flowtide-plugin .close-modal:hover { color: var(--del-btn-color); }
        .flowtide-plugin .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.2rem; }
        .flowtide-plugin .json-editor { width: 100%; background: var(--json-editor-bg); color: var(--json-editor-text); font-family: monospace; font-size: 0.8rem; padding: 1rem; border-radius: 1.2rem; border: 1px solid var(--card-border); resize: vertical; outline: none; }
        .flowtide-plugin .modal-actions { display: flex; gap: 0.8rem; justify-content: flex-end; }
        .flowtide-plugin .modal-btn { background: var(--input-bg); border: 1px solid var(--card-border); padding: 0.6rem 1.4rem; border-radius: 2rem; font-weight: 600; font-size: 0.8rem; cursor: pointer; color: var(--text-secondary); }
        .flowtide-plugin .modal-btn:hover { background: var(--menu-item-hover); }
        .flowtide-plugin .modal-btn.primary { background: var(--add-btn-bg); border-color: var(--add-btn-bg); color: #fff; }
        .flowtide-plugin .modal-btn.primary:hover { background: var(--add-btn-hover); }
        .flowtide-plugin .toast-msg { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: var(--toast-bg); color: var(--toast-text); padding: 8px 20px; border-radius: 40px; font-size: 0.8rem; font-weight: 500; z-index: 1100; opacity: 0; transition: opacity 0.2s; pointer-events: none; box-shadow: var(--card-shadow-hover); border: 1px solid var(--card-border); }
        .flowtide-plugin .note-edit-area { width: 100%; background: var(--note-bg); border: 1px solid var(--note-border); border-radius: 12px; padding: 0.5rem; font-size: 0.75rem; resize: vertical; margin-top: 0.4rem; outline: none; color: var(--text-primary); }
        .flowtide-plugin .note-edit-area:focus { border-color: var(--input-focus); }
        .flowtide-plugin .edit-input-field { width: 100%; border: none; border-bottom: 2px solid var(--edit-input-border); background: var(--edit-input-bg); padding: 0.3rem 0; font-size: 1rem; font-weight: 600; outline: none; color: var(--text-primary); }
        .flowtide-plugin .hidden { display: none; }
        @media (max-width: 560px) {
            .flowtide-plugin { padding: 0.75rem; }
            .flowtide-plugin .task-card-new { flex-wrap: wrap; }
            .flowtide-plugin .action-group { margin-left: auto; }
        }
        `;
        container.appendChild(style);

        const appWrap = document.createElement("div");
        appWrap.className = `flowtide-plugin`;
        appWrap.innerHTML = `
        <div class="app-container">
        <div class="header-flex">
        <div class="brand-area" id="brandToggle">
        <div class="icon-badge" id="headerIcon">🌸</div>
        <div class="title-group">
        <h1 id="headerTitle">Flowtide</h1>
        </div>
        </div>
        <div class="right-stats">
        <div class="toggle-group">
        <div class="zoom-control" title="Adjust task card size">
        <span>🔍</span>
        <input type="range" id="zoomSlider" min="0.7" max="1.6" step="0.05" value="1" />
        <span class="zoom-label" id="zoomLabel">100%</span>
        </div>
        <div class="show-hidden-toggle" id="showHiddenToggle" title="Show/Hide hidden tasks">🙈 Hide mode</div>
        <div class="header-menu-wrap">
        <button class="json-modal-btn" id="headerMenuBtn" title="More options">⋯</button>
        <div class="header-menu" id="headerMenu">
        <div class="dropdown-brand">
        <span class="brand-icon">🌸</span>
        <span class="brand-name">Flowtide</span>
        </div>
        <button class="header-menu-item" id="exportBtn">
        <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Save workspace file
        </button>
        <button class="header-menu-item" id="importBtn">
        <svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        Open backup file
        </button>
        <button class="header-menu-item" id="openJsonModalBtn">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        Advanced configuration
        </button>
        </div>
        </div>
        </div>
        <input type="file" id="taskFileImport" style="display:none" />
        </div>
        </div>
        <div id="inputArea" style="flex-shrink:0;">
        <div class="input-card-modern">
        <input type="text" id="taskInput" placeholder="write a delightful task…" autocomplete="off" />
        <div class="priority-group" id="priorityGroup">
        <button type="button" class="priority-btn" data-prio="High" title="High priority">🔥</button>
        <button type="button" class="priority-btn active" data-prio="Med" title="Medium priority">🌿</button>
        <button type="button" class="priority-btn" data-prio="Low" title="Low priority">🍃</button>
        </div>
        <button class="add-circle" id="addTaskBtn">+</button>
        </div>
        </div>
        <div class="task-feed" id="taskListContainer"></div>
        </div>
        <div id="jsonModal" class="modal-overlay">
        <div class="modal-container">
        <div class="modal-header">
        <h3>⚙️ Configuration Editor</h3>
        <button class="close-modal" id="closeModalBtn">✕</button>
        </div>
        <div class="modal-body">
        <textarea id="modalJsonTextarea" class="json-editor" rows="10" placeholder="Your tasks JSON will appear here…"></textarea>
        <div class="modal-actions">
        <button id="modalCopyBtn" class="modal-btn">📋 Copy to Clipboard</button>
        <button id="modalApplyBtn" class="modal-btn primary">✅ Apply Changes</button>
        </div>
        </div>
        </div>
        </div>
        <div id="toastMsg" class="toast-msg"></div>
        `;
        container.appendChild(appWrap);

        const DATA_FILE = "Flowtide-Data.selah";
        let currentZoom = 1;
        let saveTimer = null;
        let tasks = [];
        let isArchive = false;
        let currentPriority = "Med";
        let selectedTaskId = null;
        let showHidden = false;
        let cardMenuOpen = false;

        const $ = (id) => appWrap.querySelector(`#${id}`);
        const $$ = (sel) => appWrap.querySelectorAll(sel);

        function showToast(message, duration = 2000) {
            const toast = $("toastMsg");
            if (!toast) return;
            toast.textContent = message;
            toast.style.opacity = "1";
            clearTimeout(toast._hideTimer);
            toast._hideTimer = setTimeout(() => { toast.style.opacity = "0"; }, duration);
        }

        async function saveData() {
            const zoom = currentZoom;
            try {
                let body = "";
                tasks.forEach(t => {
                    body += `Task:\n`;
                    body += `ID: ${t.id}\n`;
                    body += `Text: ${t.text.replace(/\n/g, '\\n')}\n`;
                    body += `Priority: ${t.priority}\n`;
                    body += `Completed: ${t.completed}\n`;
                    body += `Hidden: ${!!t.hidden}\n`;
                    body += `CompletedAt: ${t.completedAt || ""}\n`;
                    body += `Note: ${(t.note || "").replace(/\n/g, '\\n')}\n\n`;
                });

                const content = `---\ntitle: Flowtide Data\nzoom: ${zoom}\n---\n\n${body}`;
                await ctx.fs.writeText(DATA_FILE, content);
            } catch(e) {
                console.error("Save failed", e);
            }
            render();
        }

        function queueSave() {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(() => { saveData(); }, 500);
        }

        function render() {
            const container = $("taskListContainer");
            if (!container) return;

            const headerTitle = $("headerTitle");
            const headerIcon = $("headerIcon");
            const inputArea = $("inputArea");

            if (isArchive) {
                headerTitle.innerText = "Time capsule";
                headerIcon.innerText = "📦";
                if (inputArea) inputArea.classList.add("hidden");
            } else {
                headerTitle.innerText = "Flowtide";
                headerIcon.innerText = "🌸";
                if (inputArea) inputArea.classList.remove("hidden");
            }

            // Sync the custom Sidebar UI if it exists
            if (ctx.sidebarContainer) {
                const tasksBtn = ctx.sidebarContainer.querySelector("#sb-tasks");
                const archiveBtn = ctx.sidebarContainer.querySelector("#sb-archive");
                if (tasksBtn && archiveBtn) {
                    if (!isArchive) {
                        tasksBtn.className = "w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors text-left cursor-pointer bg-[#2a3136] text-gray-100";
                        archiveBtn.className = "w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors text-left cursor-pointer text-gray-400 hover:text-gray-100 hover:bg-[#1e2327]";
                    } else {
                        tasksBtn.className = "w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors text-left cursor-pointer text-gray-400 hover:text-gray-100 hover:bg-[#1e2327]";
                        archiveBtn.className = "w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors text-left cursor-pointer bg-[#2a3136] text-gray-100";
                    }
                }
            }

            let filtered;
            if (isArchive) {
                filtered = tasks.filter(t => t.completed === true);
            } else {
                filtered = tasks.filter(t => {
                    if (t.completed) return false;
                    if (!showHidden && t.hidden) return false;
                    return true;
                });
            }

            const priorityOrder = { High: 3, Med: 2, Low: 1 };
            filtered.sort((a, b) => {
                if (priorityOrder[a.priority] !== priorityOrder[b.priority]) return priorityOrder[b.priority] - priorityOrder[a.priority];
                return b.id - a.id;
            });

            if (filtered.length === 0) {
                container.innerHTML = `<div class="empty-whimsy">${isArchive ? "📭 archive is quiet… nothing completed yet." : (showHidden ? "✨ No visible tasks. Unhide or add new ones." : "✨ All tasks are hidden. Toggle \"Show hidden\" to see them.")}</div>`;
                return;
            }

            container.innerHTML = "";
            filtered.forEach(task => {
                const isSelected = (selectedTaskId === task.id);
                const card = document.createElement("div");
                card.className = `task-card-new ${task.completed ? "completed" : ""} ${isSelected ? "selected" : ""}`;
                card.dataset.id = task.id;

                let completionHtml = "";
                if (task.completed && task.completedAt) {
                    const dateObj = new Date(task.completedAt);
                    const formattedDate = dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" });
                    const formattedTime = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                    completionHtml = `<span class="complete-date">✓ done ${formattedDate} at ${formattedTime}</span>`;
                }

                const showEditBtn = (!task.completed);
                let noteHtml = task.note && task.note.trim() !== ""
                ? `<div class="task-note" id="note-display-${task.id}">📝 ${escapeHtml(task.note)}</div>`
                : `<div id="note-display-${task.id}" style="display:none;"></div>`;

                let actionsHtml = `
                <div class="action-group">
                <button class="icon-btn menu-btn" data-menu-id="${task.id}" title="more actions">⋯</button>
                <div class="card-menu ${(selectedTaskId === task.id && cardMenuOpen) ? "open" : ""}" id="card-menu-${task.id}">
                ${showEditBtn ? `<button class="menu-item edit-btn" data-edit-id="${task.id}">✏️ Edit</button>` : ""}
                <button class="menu-item note-btn" data-note-id="${task.id}">📝 Note</button>
                ${showEditBtn ? `<button class="menu-item hide-btn" data-hide-id="${task.id}">${task.hidden ? "👁️ Unhide" : "🙈 Hide"}</button>` : ""}
                <button class="menu-item del-btn" data-del-id="${task.id}">🗑️ Delete</button>
                </div>
                </div>
                `;

                card.innerHTML = `
                <div class="check-wrapper" data-check-id="${task.id}"><div class="fake-check"></div></div>
                <div class="task-content">
                <div class="task-title" id="task-title-${task.id}">${escapeHtml(task.text)}</div>
                <div class="task-meta-line">
                <span class="priority-chip priority-${task.priority}">${task.priority}</span>
                ${completionHtml}
                ${task.hidden && !isArchive ? `<span class="hidden-badge">🙈 hidden</span>` : ""}
                </div>
                ${noteHtml}
                </div>
                ${actionsHtml}
                `;
                container.appendChild(card);
            });
            attachTaskEvents();
        }

        function escapeHtml(str) {
            if (!str) return "";
            return str.replace(/[&<>]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]));
        }

        function attachTaskEvents() {
            $$(".check-wrapper").forEach(w => w.onclick = handleCheckClick);
            $$(".menu-btn").forEach(b => b.onclick = handleMenuToggleClick);
            $$(".del-btn").forEach(b => b.onclick = handleDeleteClick);
            $$(".edit-btn").forEach(b => b.onclick = handleEditClick);
            $$(".note-btn").forEach(b => b.onclick = handleNoteClick);
            $$(".hide-btn").forEach(b => b.onclick = handleHideClick);
            $$(".task-card-new").forEach(c => {
                c.onclick = handleCardClick;
                c.oncontextmenu = handleCardContextMenu;
            });
        }

        function handleCardContextMenu(e) {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(e.currentTarget.dataset.id);
            // If right-clicking the same card that already has its menu open, close it
            if (selectedTaskId === id && cardMenuOpen) {
                selectedTaskId = null;
                cardMenuOpen = false;
            } else {
                selectedTaskId = id;
                cardMenuOpen = true;
            }
            render();
        }

        function handleCardClick(e) {
            if (e.target.closest(".check-wrapper") || e.target.closest(".menu-btn") || e.target.closest(".card-menu")) return;
            const taskId = parseInt(e.currentTarget.dataset.id);
            selectedTaskId = (selectedTaskId === taskId) ? null : taskId;
            cardMenuOpen = false;
            render();
        }

        function handleMenuToggleClick(e) {
            e.stopPropagation();
            cardMenuOpen = !cardMenuOpen;
            render();
        }

        function handleCheckClick(e) {
            e.stopPropagation();
            const id = parseInt(e.currentTarget.closest(".task-card-new").dataset.id);
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.completed = !task.completed;
                task.completedAt = task.completed ? Date.now() : null;
                if (!isArchive ? task.completed : !task.completed) selectedTaskId = null;
                saveData();
            }
        }

        function handleDeleteClick(e) {
            e.stopPropagation();
            const id = parseInt(e.currentTarget.closest(".task-card-new").dataset.id);
            tasks = tasks.filter(t => t.id !== id);
            if (selectedTaskId === id) selectedTaskId = null;
            cardMenuOpen = false;
            saveData();
        }

        function handleEditClick(e) {
            e.stopPropagation();
            const id = parseInt(e.currentTarget.closest(".task-card-new").dataset.id);
            cardMenuOpen = false;
            startEditTask(id);
        }

        function handleNoteClick(e) {
            e.stopPropagation();
            const id = parseInt(e.currentTarget.closest(".task-card-new").dataset.id);
            cardMenuOpen = false;
            startEditNote(id);
        }

        function handleHideClick(e) {
            e.stopPropagation();
            const id = parseInt(e.currentTarget.closest(".task-card-new").dataset.id);
            const task = tasks.find(t => t.id === id);
            if (task && !task.completed) {
                task.hidden = !task.hidden;
                cardMenuOpen = false;
                saveData();
            }
        }

        function startEditTask(id) {
            const task = tasks.find(t => t.id === id);
            if (!task || task.completed) return;
            const titleSpan = $(`task-title-${id}`);
            if (!titleSpan) return;

            const currentText = task.text;
            const input = document.createElement("input");
            input.type = "text";
            input.value = currentText;
            input.className = "edit-input-field";
            titleSpan.innerHTML = "";
            titleSpan.appendChild(input);
            input.focus();

            const finish = () => {
                const newText = input.value.trim();
                if (newText !== "") task.text = newText;
                saveData();
            };
            input.oninput = (e) => {
                task.text = e.target.value;
                queueSave();
            };
            input.onblur = finish;
            input.onkeydown = (e) => {
                if (e.key === "Enter") { e.preventDefault(); input.blur(); }
                if (e.key === "Escape") { task.text = currentText; saveData(); }
            };
        }

        function startEditNote(id) {
            const task = tasks.find(t => t.id === id);
            if (!task) return;
            let noteDisplay = $(`note-display-${id}`);
            if (!noteDisplay) return;

            const isHidden = noteDisplay.style.display === "none";
            const currentNote = task.note || "";
            const textarea = document.createElement("textarea");
            textarea.value = currentNote;
            textarea.className = "note-edit-area";
            textarea.rows = 2;
            textarea.placeholder = "Write a note…";

            if (isHidden) {
                noteDisplay.style.display = "block";
                noteDisplay.style.marginTop = "0.5rem";
            }
            noteDisplay.innerHTML = "";
            noteDisplay.appendChild(textarea);
            textarea.focus();

            const save = () => { task.note = textarea.value.trim(); saveData(); };
            const cancel = () => { task.note = currentNote; saveData(); };

            textarea.oninput = (e) => {
                task.note = e.target.value;
                queueSave();
            };
            textarea.onblur = save;
            textarea.onkeydown = (e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); textarea.blur(); }
                if (e.key === "Escape") cancel();
            };
        }

        function addNewTask() {
            const input = $("taskInput");
            const text = input.value.trim();
            if (!text) return;
            tasks.push({
                id: Date.now(),
                       text: text,
                       priority: currentPriority,
                       completed: false,
                       completedAt: null,
                       note: "",
                       hidden: false
            });
            input.value = "";
            selectedTaskId = null;
            saveData();
        }

        function setZoomValue(val) {
            if (isNaN(val)) return;
            const slider = $("zoomSlider");
            const label = $("zoomLabel");
            if (slider) slider.value = val;
            if (label) label.textContent = Math.round(val * 100) + "%";
            appWrap.style.setProperty("--task-zoom", val);
            currentZoom = val;
            saveData();
        }

        $("brandToggle").onclick = () => { isArchive = !isArchive; selectedTaskId = null; render(); };
        $("showHiddenToggle").onclick = (e) => {
            showHidden = !showHidden;
            e.currentTarget.textContent = showHidden ? "👁️ Show hidden" : "🙈 Hide mode";
            e.currentTarget.classList.toggle("active", showHidden);
            render();
        };
        $("headerMenuBtn").onclick = (e) => {
            e.stopPropagation();
            $("headerMenu").classList.toggle("open");
        };
        $("zoomSlider").oninput = (e) => setZoomValue(parseFloat(e.target.value));
        $("addTaskBtn").onclick = addNewTask;
        $("taskInput").onkeypress = (e) => { if (e.key === "Enter") addNewTask(); };

        $$(".priority-btn").forEach(btn => {
            btn.onclick = () => {
                $$(".priority-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                currentPriority = btn.dataset.prio;
            };
        });

        const handleDocumentClick = (e) => {
            if (!e.target.closest(".header-menu-wrap")) {
                const menu = $("headerMenu");
                if (menu) menu.classList.remove("open");
            }
            // Left click anywhere outside a task card closes the menu
            if (!e.target.closest(".task-card-new") && selectedTaskId !== null) {
                selectedTaskId = null;
                cardMenuOpen = false;
                render();
            }
        };

        const handleDocumentContextMenu = (e) => {
            // Right click anywhere outside a task card closes the menu
            if (!e.target.closest(".task-card-new") && selectedTaskId !== null) {
                selectedTaskId = null;
                cardMenuOpen = false;
                render();
            }
        };

        document.addEventListener("click", handleDocumentClick);
        document.addEventListener("contextmenu", handleDocumentContextMenu);

        // ── Export / Import Buttons ─────────────────────────────────────────
        $("exportBtn").onclick = async () => {
            const zoom = parseFloat($("zoomSlider")?.value) || 1;
            let body = "";
            tasks.forEach(t => {
                body += `Task:\n`;
                body += `ID: ${t.id}\n`;
                body += `Text: ${t.text.replace(/\n/g, '\\n')}\n`;
                body += `Priority: ${t.priority}\n`;
                body += `Completed: ${t.completed}\n`;
                body += `Hidden: ${!!t.hidden}\n`;
                body += `CompletedAt: ${t.completedAt || ""}\n`;
                body += `Note: ${(t.note || "").replace(/\n/g, '\\n')}\n\n`;
            });

            const content = `---\ntitle: Flowtide Backup\nzoom: ${zoom}\n---\n\n${body}`;

            try {
                // Open Tauri's native Save As dialog using ctx.fs
                const filePath = await ctx.fs.saveDialog({
                    defaultPath: 'Flowtide-Backup.selah',
                    filters: [{ name: 'Selah Note', extensions: ['selah'] }]
                });

                if (filePath) {
                    // Write the file using ctx.fs
                    await ctx.fs.writeTextFile(filePath, content);
                    showToast("💾 Saved .selah backup");
                }
            } catch (err) {
                console.error("Save failed", err);
                showToast("❌ Save failed");
            }
        };

        $("importBtn").onclick = () => $("taskFileImport").click();

        $("taskFileImport").onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const raw = ev.target.result;
                    const zoomMatch = raw.match(/zoom:\s*([\d.]+)/);
                    if (zoomMatch && zoomMatch[1]) setZoomValue(parseFloat(zoomMatch[1]));

                    const body = raw.split(/---\s*\n/).pop() || raw;
                    const blocks = body.split("Task:\n").filter(b => b.trim() !== "");

                    const parsedTasks = [];
                    for (const block of blocks) {
                        const lines = block.split("\n");
                        let t = { id: Date.now(), text: "", priority: "Med", completed: false, hidden: false, completedAt: null, note: "" };

                        for (const line of lines) {
                            if (line.startsWith("ID: ")) t.id = parseInt(line.slice(4));
                            else if (line.startsWith("Text: ")) t.text = line.slice(6).replace(/\\n/g, '\n');
                            else if (line.startsWith("Priority: ")) t.priority = line.slice(10).trim();
                            else if (line.startsWith("Completed: ")) t.completed = line.slice(11).trim() === "true";
                            else if (line.startsWith("Hidden: ")) t.hidden = line.slice(8).trim() === "true";
                            else if (line.startsWith("CompletedAt: ")) {
                                const val = line.slice(13).trim();
                                t.completedAt = (val && val !== "null") ? parseInt(val) : null;
                            }
                            else if (line.startsWith("Note: ")) t.note = line.slice(6).replace(/\\n/g, '\n');
                        }
                        if (t.text) parsedTasks.push(t);
                    }

                    if (parsedTasks.length > 0) {
                        tasks = parsedTasks;
                        saveData();
                        showToast("🎉 Restored from backup");
                    } else {
                        showToast("❌ Invalid backup file");
                    }
                } catch (err) {
                    showToast("❌ Parse error");
                }
            };
            reader.readAsText(file);
            e.target.value = ""; // reset input
        };

        const modal = $("jsonModal");
        function openModal() {
            const payload = { tasks, zoom: parseFloat($("zoomSlider")?.value) || 1 };
            $("modalJsonTextarea").value = JSON.stringify(payload, null, 2);
            modal.classList.add("active");
        }
        function closeModal() { modal.classList.remove("active"); }

        $("openJsonModalBtn").onclick = openModal;
        $("closeModalBtn").onclick = closeModal;
        modal.onclick = (e) => { if (e.target === modal) closeModal(); };
        $("modalCopyBtn").onclick = () => {
            navigator.clipboard.writeText($("modalJsonTextarea").value).then(() => showToast("✅ Copied!"));
        };
        $("modalApplyBtn").onclick = () => {
            try {
                const parsed = JSON.parse($("modalJsonTextarea").value);
                if (parsed.tasks && Array.isArray(parsed.tasks)) {
                    tasks = parsed.tasks;
                    if (typeof parsed.zoom === 'number') setZoomValue(parsed.zoom);
                    saveData();
                    closeModal();
                    showToast("🎉 Restored successfully");
                } else {
                    showToast("❌ Invalid JSON structure");
                }
            } catch (e) { showToast("❌ Parse error"); }
        };

        (async () => {
            try {
                const raw = await ctx.fs.readText(DATA_FILE);
                if (raw) {
                    // 1. Get Zoom from frontmatter
                    const zoomMatch = raw.match(/zoom:\s*([\d.]+)/);
                    if (zoomMatch && zoomMatch[1]) {
                        setZoomValue(parseFloat(zoomMatch[1]));
                    }

                    // 2. Parse Tasks from the body
                    const body = raw.split(/---\s*\n/).pop() || raw; // get everything after frontmatter
                    const blocks = body.split("Task:\n").filter(b => b.trim() !== "");

                    const parsedTasks = [];
                    for (const block of blocks) {
                        const lines = block.split("\n");
                        let t = { id: Date.now(), text: "", priority: "Med", completed: false, hidden: false, completedAt: null, note: "" };

                        for (const line of lines) {
                            if (line.startsWith("ID: ")) t.id = parseInt(line.slice(4));
                            else if (line.startsWith("Text: ")) t.text = line.slice(6).replace(/\\n/g, '\n');
                            else if (line.startsWith("Priority: ")) t.priority = line.slice(10).trim();
                            else if (line.startsWith("Completed: ")) t.completed = line.slice(11).trim() === "true";
                            else if (line.startsWith("Hidden: ")) t.hidden = line.slice(8).trim() === "true";
                            else if (line.startsWith("CompletedAt: ")) {
                                const val = line.slice(13).trim();
                                t.completedAt = (val && val !== "null") ? parseInt(val) : null;
                            }
                            else if (line.startsWith("Note: ")) t.note = line.slice(6).replace(/\\n/g, '\n');
                        }
                        if (t.text) parsedTasks.push(t); // Only add if text exists
                    }

                    if (parsedTasks.length > 0) {
                        tasks = parsedTasks;
                    } else {
                        // Fallback for old JSON format
                        const match = raw.match(/flowtide_data:\s*(?:json:)?(.*)/);
                        if (match && match[1]) {
                            const parsed = JSON.parse(match[1].trim());
                            tasks = parsed.tasks || [];
                            if (typeof parsed.zoom === 'number') setZoomValue(parsed.zoom);
                        }
                    }
                }
            } catch (e) { console.error("Load failed", e); }
            render();
        })();

        // ── Custom Sidebar Injection ────────────────────────────────────────
        if (ctx.sidebarContainer) {
            ctx.sidebarContainer.innerHTML = `
                <div class="p-2 space-y-1">
                    <div class="text-[10px] uppercase tracking-wider text-gray-500 px-3 py-1 mt-2">Flowtide Menu</div>
                    <button id="sb-tasks" class="w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors text-left cursor-pointer">
                        <span class="text-lg leading-none">🌸</span> Tasks
                    </button>
                    <button id="sb-archive" class="w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors text-left cursor-pointer">
                        <span class="text-lg leading-none">📦</span> Archive
                    </button>
                </div>
            `;

            ctx.sidebarContainer.querySelector("#sb-tasks").onclick = () => {
                isArchive = false;
                selectedTaskId = null;
                render();
            };

            ctx.sidebarContainer.querySelector("#sb-archive").onclick = () => {
                isArchive = true;
                selectedTaskId = null;
                render();
            };
        }

        return () => {
            document.removeEventListener("click", handleDocumentClick);
            document.removeEventListener("contextmenu", handleDocumentContextMenu);

            // 1. Cancel any pending debounced saves so they don't overlap
            clearTimeout(saveTimer);

            // 2. Force an immediate final save, even if the list is empty (e.g. user deleted the last task)
            saveData();

            container.innerHTML = "";
            if (ctx.sidebarContainer) ctx.sidebarContainer.innerHTML = "";
        };
    }
});
