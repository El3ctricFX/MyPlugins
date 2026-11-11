// Excalidraw plugin for Selah — File-Based Architecture
const EXCALIDRAW_VERSION = "0.17.6";
const REACT_VERSION = "18.2.0";
const CDN = "https://unpkg.com";

function currentTheme() {
    const light =
    document.body.classList.contains("theme-light-surface") ||
    document.documentElement.getAttribute("data-theme") === "light";
    return light ? "light" : "dark";
}

function isReadMode() {
    try { return localStorage.getItem("note-mode") === "read"; } catch { return false; }
}

function parseDateString(str) {
    if (!str) return null;
    // 1. Match YYYY-MM-DD or YYYY/MM/DD
    let m = str.match(/(\d{4})[-/](\d{2})[-/](\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;

    // 2. Match Month DD, YYYY (e.g., December 20, 2024)
    const months = {
        jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
        jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };
    m = str.match(/([a-zA-Z]{3,9})\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/);
    if (m) {
        const mon = months[m[1].toLowerCase().slice(0, 3)];
        if (mon) return `${m[3]}-${mon}-${m[2].padStart(2, '0')}`;
    }

    // 3. Match DD Month YYYY (e.g., 20 December 2024)
    m = str.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([a-zA-Z]{3,9}),?\s+(\d{4})/);
    if (m) {
        const mon = months[m[2].toLowerCase().slice(0, 3)];
        if (mon) return `${m[3]}-${mon}-${m[1].padStart(2, '0')}`;
    }

    // 4. Match MM/DD/YYYY or MM-DD-YYYY (American format)
    m = str.match(/\b(\d{1,2})[-/](\d{1,2})[-/](\d{4})\b/);
    if (m) {
        return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
    }

    return null;
}

function getNoteDate(editor) {
    // 1. Check the document title and URL
    const titleMatch = parseDateString(document.title) || parseDateString(window.location.href);
    if (titleMatch) return titleMatch;

    // 2. Check the entire editor's document blocks
    if (editor && editor.document) {
        const allText = editor.document.map(block => {
            if (!block.content) return "";
            if (Array.isArray(block.content)) return block.content.map(c => c.text || "").join("");
            return typeof block.content === 'string' ? block.content : "";
        }).join(" ");

        const docMatch = parseDateString(allText);
        if (docMatch) return docMatch;
    }

    // 3. Check the sidebar or note title input elements
    const titleEl = document.querySelector('h1, [data-title], .note-title, input[placeholder="Untitled"]');
    if (titleEl) {
        const elMatch = parseDateString(titleEl.value || titleEl.textContent || "");
        if (elMatch) return elMatch;
    }

    // 4. Aggressive scan of the sidebar text
    const sidebar = document.querySelector('.sidebar, aside, nav');
    if (sidebar) {
        const sidebarMatch = parseDateString(sidebar.textContent);
        if (sidebarMatch) return sidebarMatch;
    }

    // 5. Fallback to local system date
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function buildSrcDoc(theme) {
    return `<!doctype html>
    <html style="color-scheme:${theme}">
    <head>
    <meta charset="utf-8">
    <style>
    html, body, #root { margin:0; height:100%; width:100%; overflow:hidden; background:transparent; }
    </style>
    <script>window.EXCALIDRAW_ASSET_PATH = "${CDN}/@excalidraw/excalidraw@${EXCALIDRAW_VERSION}/dist/";</script>
    <script src="${CDN}/react@${REACT_VERSION}/umd/react.production.min.js"></script>
    <script src="${CDN}/react-dom@${REACT_VERSION}/umd/react-dom.production.min.js"></script>
    <script src="${CDN}/@excalidraw/excalidraw@${EXCALIDRAW_VERSION}/dist/excalidraw.production.min.js"></script>
    </head>
    <body>
    <div id="root"></div>
    <script>
    (function () {
        function send(m) { m.src = "selah-excalidraw"; parent.postMessage(m, "*"); }

        if (!window.React || !window.ReactDOM || !window.ExcalidrawLib) {
            send({ type: "error" });
            return;
        }

        var E = React.createElement;
        var Excalidraw = ExcalidrawLib.Excalidraw;
        var MainMenu = ExcalidrawLib.MainMenu;
        var ContextMenu = ExcalidrawLib.ContextMenu;
        var root = null;
        var lastSig = null;
        var timer = null;
        var pending = null;
        var excalidrawAPI = null;

        function sigOf(elements, appState, files) {
            var s = appState.viewBackgroundColor + "|" + appState.gridSize + "|" + Object.keys(files || {}).length;
            for (var i = 0; i < elements.length; i++) {
                s += "|" + elements[i].id + ":" + elements[i].version + ":" + (elements[i].isDeleted ? 1 : 0);
            }
            return s;
        }

        function pack(elements, appState, files) {
            var live = elements.filter(function (e) { return !e.isDeleted; });
            var used = {};
            live.forEach(function (e) {
                if (e.type === "image" && e.fileId && files && files[e.fileId]) used[e.fileId] = files[e.fileId];
            });
                return JSON.stringify({
                    type: "excalidraw",
                    version: 2,
                    source: "selah",
                    elements: live,
                    appState: { viewBackgroundColor: appState.viewBackgroundColor, gridSize: appState.gridSize },
                    files: used
                });
        }

        function flush() {
            if (!pending) return;
            var p = pending;
            pending = null;
            clearTimeout(timer);
            send({ type: "change", data: pack(p[0], p[1], p[2]) });
        }
        window.addEventListener("pagehide", flush);
        document.addEventListener("visibilitychange", function () { if (document.hidden) flush(); });

        function App(p) {
            var st = React.useState(p.cfg);
            var cfg = st[0], setCfg = st[1];
            var initial = React.useRef(p.cfg.data).current;
            var gridSt = React.useState(function () {
                return (initial.appState && initial.appState.gridSize) || null;
            });
            var gridSize = gridSt[0], setGridSize = gridSt[1];
            React.useEffect(function () { window.__setCfg = setCfg; }, []);
            React.useEffect(function () { window.__setGridSize = setGridSize; }, []);

            function doReorder(kind) {
                if (!excalidrawAPI) return;
                try {
                    var els = excalidrawAPI.getSceneElements();
                    var a = excalidrawAPI.getAppState();
                    var sel = a.selectedElementIds || {};
                    var selIds = {};
                    var hasSel = false;
                    Object.keys(sel).forEach(function(id) {
                        if (sel[id]) { selIds[id] = true; hasSel = true; }
                    });
                    if (!hasSel) return;
                    var moving, rest, i, tmp;
                    if (kind === "front") {
                        moving = els.filter(function(e) { return selIds[e.id]; });
                        rest = els.filter(function(e) { return !selIds[e.id]; });
                        els = rest.concat(moving);
                    } else if (kind === "back") {
                        moving = els.filter(function(e) { return selIds[e.id]; });
                        rest = els.filter(function(e) { return !selIds[e.id]; });
                        els = moving.concat(rest);
                    } else if (kind === "forward") {
                        for (i = els.length - 2; i >= 0; i--) {
                            if (selIds[els[i].id] && !selIds[els[i + 1].id]) {
                                tmp = els[i]; els[i] = els[i + 1]; els[i + 1] = tmp;
                            }
                        }
                    } else if (kind === "backward") {
                        for (i = 1; i < els.length; i++) {
                            if (selIds[els[i].id] && !selIds[els[i - 1].id]) {
                                tmp = els[i]; els[i] = els[i - 1]; els[i - 1] = tmp;
                            }
                        }
                    }
                    excalidrawAPI.updateScene({ elements: els });
                } catch (err) { console.error("[excalidraw] reorder failed:", err); }
            }

            function doToggleGrid() {
                if (!excalidrawAPI) return;
                try {
                    var a = excalidrawAPI.getAppState();
                    var newSize = a.gridSize ? null : 20;
                    excalidrawAPI.updateScene({ appState: { gridSize: newSize } });
                    setGridSize(newSize);
                } catch (err) { console.error("[excalidraw] toggleGrid failed:", err); }
            }

            function doSetStrokeStyle(style) {
                if (!excalidrawAPI) return;
                try {
                    var els = excalidrawAPI.getSceneElements();
                    var a = excalidrawAPI.getAppState();
                    var sel = a.selectedElementIds || {};
                    var selIds = {};
                    var hasSel = false;
                    Object.keys(sel).forEach(function(id) {
                        if (sel[id]) { selIds[id] = true; hasSel = true; }
                    });
                    if (!hasSel) return;

                    var newEls = els.map(function(el) {
                        if (selIds[el.id]) {
                            return Object.assign({}, el, {
                                strokeStyle: style,
                                version: el.version + 1,
                                versionNonce: Math.floor(Math.random() * 100000)
                            });
                        }
                        return el;
                    });

                    excalidrawAPI.updateScene({
                        elements: newEls,
                        appState: { currentItemStrokeStyle: style }
                    });
                } catch (err) { console.error("[excalidraw] setStrokeStyle failed:", err); }
            }

            function doSetSloppiness(level) {
                if (!excalidrawAPI) return;
                try {
                    var els = excalidrawAPI.getSceneElements();
                    var a = excalidrawAPI.getAppState();
                    var sel = a.selectedElementIds || {};
                    var selIds = {};
                    var hasSel = false;
                    Object.keys(sel).forEach(function(id) {
                        if (sel[id]) { selIds[id] = true; hasSel = true; }
                    });
                    if (!hasSel) return;

                    var newEls = els.map(function(el) {
                        if (selIds[el.id]) {
                            return Object.assign({}, el, {
                                roughness: level,
                                version: el.version + 1,
                                versionNonce: Math.floor(Math.random() * 100000)
                            });
                        }
                        return el;
                    });

                    excalidrawAPI.updateScene({
                        elements: newEls,
                        appState: { currentItemRoughness: level }
                    });
                } catch (err) { console.error("[excalidraw] setSloppiness failed:", err); }
            }

            var D = MainMenu && MainMenu.DefaultItems;
            var menu = MainMenu ? E(MainMenu, null,
                                    E(MainMenu.ItemCustom, {
                                        key: "grid",
                                        onPointerDown: function(ev) { ev.stopPropagation(); },
                                      onMouseDown: function(ev) { ev.stopPropagation(); },
                                      onClick: function(ev) { ev.stopPropagation(); doToggleGrid(); },
                                      style: { cursor: "pointer", userSelect: "none" }
                                    }, (gridSize ? "✓ " : "\u2007 ") + (gridSize ? "Hide grid" : "Show grid")),
                                    D ? E(MainMenu.Separator) : null,
                                    D && D.ChangeCanvasBackground ? E(D.ChangeCanvasBackground) : null,
                                    D && D.LoadScene ? E(D.LoadScene) : null,
                                    D && D.ClearCanvas ? E(D.ClearCanvas) : null,
                                    D && D.SaveAsImage ? E(D.SaveAsImage) : null
            ) : null;

            var DC = ContextMenu && ContextMenu.DefaultItems;
            var ctxMenu = ContextMenu ? E(ContextMenu, null,
                                          DC && DC.Copy ? E(DC.Copy) : null,
                                          DC && DC.Paste ? E(DC.Paste) : null,
                                          DC && DC.Duplicate ? E(DC.Duplicate) : null,
                                          DC && DC.Delete ? E(DC.Delete) : null,
                                          E(ContextMenu.Separator),
                                          E(ContextMenu.Item, { onSelect: function() { doReorder("front"); } }, "Bring to front"),
                                          E(ContextMenu.Item, { onSelect: function() { doReorder("forward"); } }, "Bring forward"),
                                          E(ContextMenu.Item, { onSelect: function() { doReorder("backward"); } }, "Send backward"),
                                          E(ContextMenu.Item, { onSelect: function() { doReorder("back"); } }, "Send to back"),
                                          E(ContextMenu.Separator),
                                          E(ContextMenu.Item, { onSelect: function() { doSetStrokeStyle("solid"); }, predicate: function() { return true; } }, "Border: Solid"),
                                          E(ContextMenu.Item, { onSelect: function() { doSetStrokeStyle("dashed"); }, predicate: function() { return true; } }, "Border: Dashed"),
                                          E(ContextMenu.Item, { onSelect: function() { doSetStrokeStyle("dotted"); }, predicate: function() { return true; } }, "Border: Dotted"),
                                          E(ContextMenu.Separator),
                                          E(ContextMenu.Item, { onSelect: function() { doSetSloppiness(0); }, predicate: function() { return true; } }, "Style: Clean"),
                                          E(ContextMenu.Item, { onSelect: function() { doSetSloppiness(1); }, predicate: function() { return true; } }, "Style: Hand-drawn"),
                                          E(ContextMenu.Item, { onSelect: function() { doSetSloppiness(2); }, predicate: function() { return true; } }, "Style: Cartoonist")
            ) : null;

            return E(Excalidraw, {
                excalidrawAPI: function(api) { excalidrawAPI = api; },
                     initialData: initial,
                     theme: cfg.theme,
                     viewModeEnabled: cfg.readOnly,
                     onChange: function (elements, appState, files) {
                         var sig = sigOf(elements, appState, files);
                         if (lastSig === null) { lastSig = sig; return; }
                         if (sig === lastSig) return;
                         lastSig = sig;
                         pending = [elements, appState, files];
                         clearTimeout(timer);
                         timer = setTimeout(flush, 300);
                     },
                     UIOptions: {
                         canvasActions: {
                             loadScene: true,
                             saveToActiveFile: false,
                             changeViewBackgroundColor: true,
                             clearCanvas: true,
                             saveAsImage: true,
                             export: { saveFileToDisk: true },
                             toggleTheme: false
                         }
                     }
            }, menu, ctxMenu);
        }

        window.addEventListener("message", function (e) {
            if (e.source !== parent) return;
            var m = e.data;
            if (!m || !m.type) return;

            if (m.type === "init" && !root) {
                var data = {};
                try { data = JSON.parse(m.data || "{}"); } catch (err) {}
                var safeApp = Object.assign({ viewBackgroundColor: "transparent" }, data.appState || {});
                delete safeApp.scrollX;
                delete safeApp.scrollY;
                delete safeApp.zoom;
                delete safeApp.scrollToContent;
                delete safeApp.cursorButton;

                if (safeApp.currentItemRoughness === undefined) safeApp.currentItemRoughness = 1;

                var initial = {
                    elements: data.elements || [],
                    appState: safeApp,
                    files: data.files || {},
                    scrollToContent: true
                };
                document.documentElement.style.colorScheme = m.theme;
                root = ReactDOM.createRoot(document.getElementById("root"));
                root.render(E(App, { cfg: { theme: m.theme, readOnly: !!m.readOnly, data: initial } }));
                setTimeout(function () { send({ type: "loaded" }); }, 300);
            } else if (m.type === "config") {
                document.documentElement.style.colorScheme = m.theme;
                if (window.__setCfg) window.__setCfg({ theme: m.theme, readOnly: !!m.readOnly });
            } else if (m.type === "load" && m.data && excalidrawAPI) {
                try {
                    var parsed = JSON.parse(m.data);
                    var safeApp = Object.assign({}, parsed.appState || {});
                    delete safeApp.scrollX;
                    delete safeApp.scrollY;
                    delete safeApp.zoom;
                    delete safeApp.scrollToContent;
                    delete safeApp.cursorButton;
                    delete safeApp.gridSize;
                    delete safeApp.gridMode;
                    delete safeApp.gridStep;

                    if (safeApp.currentItemRoughness === undefined) safeApp.currentItemRoughness = 1;

                    excalidrawAPI.updateScene({
                        elements: parsed.elements || [],
                        appState: Object.assign({ viewBackgroundColor: "transparent", gridSize: null, gridMode: null }, safeApp),
                                              files: parsed.files || {}
                    });

                    if (window.__setGridSize) window.__setGridSize(null);

                    setTimeout(function() {
                        try {
                            var els0 = excalidrawAPI.getSceneElements();
                            if (els0 && els0.length) {
                                excalidrawAPI.scrollToContent(els0, { fitToContent: true, animate: false });
                            }
                        } catch (err) { console.error("[excalidraw] scrollToContent failed:", err); }
                    }, 60);

                    setTimeout(function() {
                        var els = excalidrawAPI.getSceneElements();
                        var app = excalidrawAPI.getAppState();
                        var files = excalidrawAPI.getFiles();
                        send({ type: "change", data: pack(els, app, files) });
                    }, 200);
                } catch(e) { console.error("Failed to load file", e); }
            }
        });

        send({ type: "ready" });
    })();
    </script>
    </body>
    </html>`;
}

selah.registerBlockSpec({
    type: "excalidraw",
    propSchema: {
        // The ID of the file inside .plugins/excalidraw-plugin/data/drawings/
        fileId: { default: "" },
        // Kept for backward compatibility (auto-migrates old notes)
        data: { default: "{}" },
        height: { default: 640 }
    },
    render: (props, React) => {
        const h = React.createElement;
        const live = props.editor.getBlock(props.block.id) ?? props.block;
        const fileId = live.props.fileId;

        const iframeRef = React.useRef(null);
        const wrapperRef = React.useRef(null);
        const fileInputRef = React.useRef(null);
        const latestData = React.useRef("{}");

        // If this is an old note, load the block's JSON into memory so it doesn't render blank
        if (latestData.current === "{}" && !fileId && live.props.data && live.props.data !== "{}") {
            latestData.current = live.props.data;
        }

        const [status, setStatus] = React.useState("loading");
        const [attempt, setAttempt] = React.useState(0);
        const [theme, setTheme] = React.useState(currentTheme);
        const [readOnly, setReadOnly] = React.useState(isReadMode);
        const [height, setHeight] = React.useState(() => Number(live.props.height) || 520);
        const [resizing, setResizing] = React.useState(false);
        const [isFullscreen, setIsFullscreen] = React.useState(false);
        const statusRef = React.useRef(status);
        statusRef.current = status;

        const srcDoc = React.useMemo(() => buildSrcDoc(currentTheme()), [attempt]);

        // 1. Auto-Migration: Move old block data to a file
        React.useEffect(() => {
            if (fileId || !live.props.data || live.props.data === "{}") return;
            const dateStr = getNoteDate(props.editor);
            const newId = `drawings/${dateStr}/drawing-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.excalidraw`;
            selah.fs.writeText(newId, live.props.data).then(() => {
                props.editor.updateBlock(props.block.id, { props: { fileId: newId, data: "{}" } });
            }).catch(console.error);
        }, [fileId, live.props.data]);

        // 2. Load the file from the plugin's data folder
        React.useEffect(() => {
            if (!fileId) return;
            let mounted = true;
            const load = async () => {
                try {
                    const text = await selah.fs.readText(fileId);
                    if (text && mounted) {
                        latestData.current = text;
                        setStatus("loading");
                        setAttempt(n => n + 1);
                    }
                } catch (e) {
                    console.error("Failed to load drawing", e);
                    if (mounted) setStatus("error");
                }
            };
            load();
            return () => { mounted = false; };
        }, [fileId]);

        // 3. Sync changes to the file system
        React.useEffect(() => {
            const onMsg = (e) => {
                const w = iframeRef.current && iframeRef.current.contentWindow;
                if (!w || e.source !== w) return;
                const m = e.data;
                if (!m || m.src !== "selah-excalidraw") return;

                if (m.type === "ready") {
                    w.postMessage({ type: "init", data: latestData.current, theme: currentTheme(), readOnly: isReadMode() }, "*");
                } else if (m.type === "loaded") {
                    setStatus("ready");
                } else if (m.type === "error") {
                    setStatus("error");
                } else if (m.type === "change" && typeof m.data === "string") {
                    latestData.current = m.data;
                    if (fileId) {
                        selah.fs.writeText(fileId, m.data).catch(err => console.error("[excalidraw] Save failed:", err));
                    }
                }
            };
            window.addEventListener("message", onMsg);
            return () => window.removeEventListener("message", onMsg);
        }, [fileId]);

        // --- FILE IMPORT LOGIC ---
        const sanitizeElements = (elements) => {
            const textMap = new Map();
            elements.forEach(el => {
                if (el.type === "text") {
                    if (el.fontFamily > 3) el.fontFamily = 2;
                    if (!el.text && el.rawText) el.text = el.rawText;
                    if (!el.text && el.originalText) el.text = el.originalText;
                    if (el.fontSize === undefined || el.fontSize < 8) el.fontSize = 20;
                    if (el.containerId) {
                        if (!textMap.has(el.containerId)) textMap.set(el.containerId, []);
                        textMap.get(el.containerId).push({ type: "text", id: el.id });
                    }
                }
            });
            elements.forEach(el => {
                if (["rectangle", "ellipse", "diamond", "arrow"].includes(el.type)) {
                    if (!el.boundElements) el.boundElements = [];
                    if (textMap.has(el.id)) {
                        const existing = new Set(el.boundElements.map(b => b.id));
                        textMap.get(el.id).forEach(t => {
                            if (!existing.has(t.id)) el.boundElements.push(t);
                        });
                    }
                }
            });
            return elements;
        };

        const processFileText = (text, originalFilename) => {
            if (text.includes("```compressed-json")) {
                alert("This is a compressed Obsidian drawing. Please open it in Obsidian, go to the menu, and export it as a standard .excalidraw file so Selah can read it.");
                return;
            }

            let json = text;
            const match = text.match(/```(?:excalidraw|json)?\s*([\s\S]*?)\s*```/);
            if (match) {
                json = match[1];
            } else {
                const first = text.indexOf("{");
                if (first !== -1) {
                    let depth = 0;
                    let last = -1;
                    for (let i = first; i < text.length; i++) {
                        if (text[i] === "{") depth++;
                        else if (text[i] === "}") {
                            depth--;
                            if (depth === 0) {
                                last = i;
                                break;
                            }
                        }
                    }
                    if (last !== -1) {
                        json = text.substring(first, last + 1);
                    }
                }
            }

            try {
                const parsed = JSON.parse(json);
                if (parsed.elements) {
                    parsed.elements = parsed.elements.filter(e => !e.isDeleted);
                    parsed.elements = sanitizeElements(parsed.elements);
                    parsed.elements.forEach(el => {
                        if (el.roughness === undefined || el.roughness === 0) el.roughness = 1;
                    });
                }

                // 1. Find the date from the imported filename OR the text inside the drawing
                let dateStr = parseDateString(originalFilename);
                if (!dateStr && parsed.elements) {
                    const textContent = parsed.elements.filter(e => e.type === "text").map(e => e.text || "").join(" ");
                    dateStr = parseDateString(textContent);
                }

                // Fallback to today if no date is found anywhere
                if (!dateStr) dateStr = getNoteDate(props.editor);

                // 2. Extract a clean name from the imported file
                let baseName = originalFilename ? originalFilename.replace(/\.(excalidraw|md)$/i, "") : "drawing";
                baseName = baseName.replace(/[^a-zA-Z0-9-_]/g, "_");

                // 3. Create the new file path
                const newId = `drawings/${dateStr}/${baseName}-${Date.now()}.excalidraw`;
                const stringified = JSON.stringify(parsed);

                // 4. Save to the new file, update the block, and delete the old empty file
                selah.fs.writeText(newId, stringified).then(() => {
                    props.editor.updateBlock(props.block.id, { props: { fileId: newId, data: "{}" } });

                    // Clean up the old file if it was different
                    if (fileId && fileId !== newId) {
                        selah.fs.remove(fileId).then(async () => {
                            // Extract the old folder path (e.g., "drawings/2026-11-10")
                            const oldFolderPath = fileId.substring(0, fileId.lastIndexOf('/'));

                            // Don't delete the main "drawings" folder
                            if (oldFolderPath && oldFolderPath !== 'drawings') {
                                try {
                                    // Check if the old folder is now empty
                                    const contents = await selah.fs.list(oldFolderPath);
                                    if (contents.length === 0) {
                                        console.log("[excalidraw] Old folder empty, moving to trash:", oldFolderPath);
                                        await selah.fs.remove(oldFolderPath);
                                    }
                                } catch (err) {
                                    console.error("[excalidraw] Failed to delete old folder:", err);
                                }
                            }
                        }).catch(console.error);
                    }
                }).catch(console.error);

            } catch (e) {
                alert("Could not parse the drawing file. Make sure it's a valid Excalidraw file or an Obsidian markdown file containing standard Excalidraw JSON.");
                console.error(e);
            }
        };

        const handleFileDrop = (e) => {
            e.preventDefault();
            if (status !== "ready") return;
            const file = e.dataTransfer.files[0];
            if (file && (file.name.endsWith(".excalidraw") || file.name.endsWith(".md"))) {
                const reader = new FileReader();
                reader.onload = (ev) => processFileText(ev.target.result, file.name);
                reader.readAsText(file);
            }
        };

        const handleFileChange = (e) => {
            const file = e.target.files?.[0];
            if (file && status === "ready") {
                const reader = new FileReader();
                reader.onload = (ev) => processFileText(ev.target.result, file.name);
                reader.readAsText(file);
            }
            if (fileInputRef.current) fileInputRef.current.value = "";
        };

            React.useEffect(() => {
                const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
                document.addEventListener("fullscreenchange", onFsChange);
                return () => document.removeEventListener("fullscreenchange", onFsChange);
            }, []);

            // Auto-delete file when block is removed from the editor
            React.useEffect(() => {
                const currentFileId = fileId;
                const currentBlockId = props.block.id;
                const editor = props.editor;

                return () => {
                    if (!currentFileId) return;

                    // Wait 2 seconds to allow for Ctrl+Z (Undo)
                    setTimeout(() => {
                        try {
                            if (!editor || !editor.document) return;

                            // Check if the block is still in the document
                            const stillExists = editor.document.some(b => b.id === currentBlockId);

                            // If it's gone, safely move the file to the trash
                            if (!stillExists) {
                                console.log("[excalidraw] Block deleted, moving file to trash:", currentFileId);
                                selah.fs.remove(currentFileId).then(async () => {
                                    // Extract folder path (e.g., "drawings/2024-12-20")
                                    const folderPath = currentFileId.substring(0, currentFileId.lastIndexOf('/'));
                                    if (folderPath) {
                                        try {
                                            // Check if the folder is empty
                                            const contents = await selah.fs.list(folderPath);
                                            if (contents.length === 0) {
                                                console.log("[excalidraw] Folder empty, moving folder to trash:", folderPath);
                                                await selah.fs.remove(folderPath);
                                            }
                                        } catch (e) {}
                                    }
                                }).catch(err =>
                                console.error("[excalidraw] Failed to delete file/folder:", err)
                                );
                            }
                        } catch (e) {
                            // Ignore errors if the editor was destroyed (e.g. note closed)
                        }
                    }, 2000);
                };
            }, [fileId]);

            React.useEffect(() => {
                setStatus("loading");
                const t = setTimeout(() => {
                    if (statusRef.current === "loading") setStatus("error");
                }, 20000);
                    return () => clearTimeout(t);
            }, [attempt]);

            React.useEffect(() => {
                const update = () => setTheme(currentTheme());
                const obs = new MutationObserver(update);
                obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
                obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
                return () => obs.disconnect();
            }, []);

            React.useEffect(() => {
                const update = () => setReadOnly(isReadMode());
                window.addEventListener("note-mode-changed", update);
                return () => window.removeEventListener("note-mode-changed", update);
            }, []);

            React.useEffect(() => {
                const w = iframeRef.current && iframeRef.current.contentWindow;
                if (w && status === "ready") w.postMessage({ type: "config", theme, readOnly }, "*");
            }, [theme, readOnly, status]);

            const toggleFullscreen = () => {
                if (!document.fullscreenElement) {
                    wrapperRef.current?.requestFullscreen().catch(err => console.error(err));
                } else {
                    document.exitFullscreen();
                }
            };

            const startResize = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const startY = e.clientY;
                const startH = height;
                let finalH = startH;
                setResizing(true);
                const onMove = (ev) => {
                    finalH = Math.max(240, Math.min(1600, startH + (ev.clientY - startY)));
                    setHeight(finalH);
                };
                const onUp = () => {
                    document.removeEventListener("mousemove", onMove);
                    document.removeEventListener("mouseup", onUp);
                    setResizing(false);
                    try { props.editor.updateBlock(props.block.id, { props: { height: finalH } }); } catch {}
                };
                document.addEventListener("mousemove", onMove);
                document.addEventListener("mouseup", onUp);
            };

            const overlayStyle = {
                position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: "8px",
                background: "var(--c-surface)", color: "var(--c-text-muted)", fontSize: "13px",
                        textAlign: "center", padding: "16px"
            };

            const headerStyle = {
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexWrap: "wrap", rowGap: "6px", columnGap: "8px",
                padding: "6px 12px", background: "var(--c-surface-alt)",
                        borderBottom: "1px solid var(--c-border)",
                        borderTopLeftRadius: isFullscreen ? "0" : "8px",
                        borderTopRightRadius: isFullscreen ? "0" : "8px",
            };

            const btnStyle = {
                background: "var(--c-elevated)", color: "var(--c-text)",
                        border: "1px solid var(--c-border)", borderRadius: "4px",
                        padding: "3px 8px", fontSize: "11px", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "4px"
            };

            return h("div", {
                ref: wrapperRef,
                "data-no-marquee": "",
                contentEditable: false,
                onMouseDown: (e) => { if (e.button === 2) { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); } },
                     onDragOver: (e) => { e.preventDefault(); },
                     onDrop: handleFileDrop,
                     style: {
                         position: "relative", width: "100%", margin: "16px 0",
                         display: "flex", flexDirection: "column",
                         height: isFullscreen ? "100vh" : height + "px",
                         borderRadius: isFullscreen ? "0" : "8px",
                         border: isFullscreen ? "none" : "1px solid var(--c-border)",
                     background: "var(--c-surface)",
                     overflow: "hidden"
                     }
            },
            h("div", { style: headerStyle },
              h("div", { style: { display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--c-text)", fontWeight: "500", flexShrink: 0 } },
                h("span", null, "✏️"),
                h("span", null, fileId ? fileId.split('/').pop() : "Excalidraw")
              ),
              h("div", { style: { display: "flex", alignItems: "center", gap: "8px" } },
                h("button", {
                    type: "button",
                    onClick: () => setAttempt(n => n + 1),
                  style: btnStyle,
                  title: "Refresh drawing from disk"
                }, "🔄 Refresh"),
                h("button", {
                    type: "button",
                    onClick: () => fileInputRef.current?.click(),
                  style: btnStyle,
                  title: "Open existing .excalidraw or .md file"
                }, "📂 Import"),
                h("button", {
                    type: "button",
                    onClick: toggleFullscreen,
                    style: btnStyle,
                    title: isFullscreen ? "Exit Fullscreen" : "Fullscreen"
                }, isFullscreen ? "✕ Exit" : "⛶ Fullscreen")
              )
            ),

            h("input", {
                type: "file",
                ref: fileInputRef,
                style: { display: "none" },
                accept: ".excalidraw, .md",
                onChange: handleFileChange
            }),

            h("iframe", {
                key: attempt,
                ref: iframeRef,
                srcDoc: srcDoc,
                title: "Excalidraw drawing",
                style: { width: "100%", flex: 1, border: 0, display: "block", background: "transparent" }
            }),

            status === "loading" && h("div", { style: overlayStyle }, "Loading Excalidraw file…"),
                     status === "error" && h("div", { style: overlayStyle },
                                             h("div", { style: { color: "var(--c-danger)" } }, "Couldn't load file or Excalidraw library."),
                                             h("button", {
                                                 type: "button",
                                                 onClick: () => setAttempt((n) => n + 1),
                                               style: { padding: "4px 12px", borderRadius: "4px", cursor: "pointer", background: "var(--c-accent)", color: "white", border: 0, fontSize: "12px" }
                                             }, "Retry")
                     ),

                     resizing && h("div", { style: { position: "absolute", inset: 0, cursor: "ns-resize", zIndex: 5 } }),
                     !readOnly && !isFullscreen && h("div", {
                         onMouseDown: startResize,
                         title: "Drag to resize",
                         style: { position: "absolute", left: 0, right: 0, bottom: 0, height: "8px", cursor: "ns-resize", zIndex: 6, background: "transparent" }
                     })
            );
    }
});

selah.registerSlashItem({
    title: "Excalidraw Drawing",
    subtext: "Create a new .excalidraw file",
    icon: "✏️",
    aliases: ["draw", "sketch", "diagram", "excalidraw"],
    run: async (editor) => {
        const dateStr = getNoteDate(editor);
        const fileId = `drawings/${dateStr}/drawing-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.excalidraw`;

        const emptyData = JSON.stringify({
            type: "excalidraw",
            version: 2,
            source: "selah",
            elements: [],
            appState: {},
            files: {}
        });

        try {
            await selah.fs.writeText(fileId, emptyData);
        } catch (e) {
            console.error("Failed to create asset file", e);
        }

        let refId = null;
        try { refId = editor.getTextCursorPosition?.().block?.id ?? null; } catch {}
        const block = { type: "excalidraw", props: { fileId: fileId, data: "{}", height: 520 } };

        editor.insertBlocks(
            [block],
            refId || editor.document[editor.document.length - 1],
            "after"
        );
    }
});
