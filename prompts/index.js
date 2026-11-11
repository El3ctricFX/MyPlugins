"use strict";

const h = React.createElement;

// ── Default prompt categories ───────────────────────────────────────────────
const DEFAULT_PROMPTS = [
    {
        id: "monthly",
        label: "Monthly Update",
        icon: "📅",
        prompts: [
            {
                title: "Monthly Update",
                text:
                "What happened this month?\n\n" +
                "Highlights:\n- \n\n" +
                "Challenges:\n- \n\n" +
                "What I learned:\n- \n\n" +
                "Looking ahead to next month:\n- "
            },
            {
                title: "This Month in Review",
                text:
                "What were the significant moments this month?\n\n" +
                "What did God teach me?\n\n" +
                "What am I most grateful for?\n\n" +
                "What do I want to carry into next month?"
            },
            {
                title: "Monthly Goals Check-in",
                text:
                "Goals I set last month:\n- \n\n" +
                "Progress I made:\n- \n\n" +
                "What got in the way:\n- \n\n" +
                "One thing I'll do differently next month:\n- "
            }
        ]
    },
{
    id: "weekly",
    label: "Weekly Reflection",
    icon: "🗓️",
    prompts: [
        {
            title: "Weekly Review",
            text:
            "Highlight of the week:\n\n" +
            "Hardest part of the week:\n\n" +
            "Looking forward to next week:\n"
        },
        {
            title: "Sunday Reflection",
            text:
            "What stood out from this week's sermon or Scripture reading?\n\n" +
            "How is God working in my life right now?\n\n" +
            "What do I want to pray about this week?"
        }
    ]
},
{
    id: "gratitude",
    label: "Gratitude",
    icon: "🙏",
    prompts: [
        {
            title: "Three Things",
            text: "Three things I'm grateful for today:\n\n1. \n2. \n3. "
        },
        {
            title: "Gratitude Deep Dive",
            text:
            "Something small that made me smile recently:\n\n" +
            "Someone who impacted me this week:\n\n" +
            "A challenge I can be grateful for in hindsight:\n"
        }
    ]
},
{
    id: "spiritual",
    label: "Spiritual",
    icon: "✝️",
    prompts: [
        {
            title: "Where is God at Work?",
            text:
            "Where do I see God working right now?\n\n" +
            "In my family:\n\n" +
            "In my work:\n\n" +
            "In my heart:\n"
        },
        {
            title: "A Verse on My Mind",
            text:
            "Verse:\n\n" +
            "Why has it been on my mind?\n\n" +
            "What does it mean for me right now?"
        },
        {
            title: "A Prayer on My Heart",
            text:
            "Adoration:\n\n" +
            "Confession:\n\n" +
            "Thanksgiving:\n\n" +
            "Supplication:\n"
        }
    ]
},
{
    id: "goals",
    label: "Goals & Growth",
    icon: "🎯",
    prompts: [
        {
            title: "This Week's Goals",
            text:
            "Three goals for this week:\n\n1. \n2. \n3. \n\n" +
            "How will I make time for these?"
        },
        {
            title: "A Habit to Build",
            text:
            "The habit:\n\n" +
            "Why I want this:\n\n" +
            "One small step today:\n\n" +
            "How I'll track it:\n"
        }
    ]
},
{
    id: "questions",
    label: "40 Questions",
    icon: "❓",
    prompts: [
        {
            title: "What brings you the most joy?",
            text:
            "When do you feel most alive?\n\n" +
            "Who do you love spending time with?\n\n" +
            "What activities make you lose track of time?\n\n" +
            "What could you do more of?"
        },
        {
            title: "When do you feel most alive?",
            text:
            "Describe a recent moment where you felt fully present.\n\n" +
            "What were you doing? Who were you with?\n\n" +
            "What made that moment special?"
        },
        {
            title: "A fear you want to overcome",
            text:
            "The fear:\n\n" +
            "Where does it come from?\n\n" +
            "What would life look like without it?\n\n" +
            "One small step toward facing it:\n"
        },
        {
            title: "What does rest look like for you?",
            text:
            "When was the last time you truly rested?\n\n" +
            "What does rest look like — physically, emotionally, spiritually?\n\n" +
            "What keeps you from resting?"
        },
        {
            title: "Who do you want to become?",
            text:
            "Describe the person you want to be in five years.\n\n" +
            "What character qualities do you want to grow?\n\n" +
            "One habit that moves you closer:\n"
        },
        {
            title: "What are you learning right now?",
            text:
            "What lesson is life teaching you lately?\n\n" +
            "Where do you feel stretched?\n\n" +
            "What would it look like to embrace that instead of resist it?"
        },
        {
            title: "Where do you feel stuck?",
            text:
            "Area where I feel stuck:\n\n" +
            "What would 'unstuck' look like?\n\n" +
            "Who could help me get there?"
        },
        {
            title: "What do you need to say no to?",
            text:
            "Things I've been saying yes to that I should say no to:\n- \n\n" +
            "What's at the root of saying yes?\n\n" +
            "What boundary would free me up?"
        }
    ]
},
{
    id: "freeform",
    label: "Free-Form Prompts",
    icon: "💭",
    prompts: [
        {
            title: "Brain Dump",
            text: "Everything on my mind right now:\n\n"
        },
        {
            title: "Letter to Future Self",
            text:
            "Dear future me,\n\n\n\n" +
            "Today I'm feeling:\n\n" +
            "I hope you remember:\n"
        },
        {
            title: "Letter to Past Self",
            text:
            "Dear past me,\n\n\n\n" +
            "Something I wish I'd known:\n\n" +
            "Something I'm proud of you for:\n"
        }
    ]
}
];

// ── Storage helpers ─────────────────────────────────────────────────────────
function loadPrompts() {
    try {
        const cached = selah.settings.get("prompts");
        if (Array.isArray(cached) && cached.length > 0) return cached;
    } catch {}
    return DEFAULT_PROMPTS;
}

function savePrompts(prompts) {
    selah.settings.set("prompts", prompts);
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function sanitizeFilename(name) {
    const clean = String(name)
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90);
    return clean || "Untitled";
}

function todayYmd() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
}

function formatDate(isoStr) {
    if (!isoStr) return "";
    try {
        const [y, m, d] = isoStr.split("-").map(Number);
        const date = new Date(y, m - 1, d);
        return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    } catch { return isoStr; }
}

async function uniqueFilename(fs, base) {
    let name = `${base}.selah`;
    let i = 2;
    while (await fs.exists(name)) {
        name = `${base} (${i}).selah`;
        i++;
        if (i > 500) {
            name = `${base} (${Date.now()}).selah`;
            break;
        }
    }
    return name;
}

function buildEntryContent(title, text, icon) {
    const now = new Date().toISOString();
    const fm = [
        `title: ${JSON.stringify(title)}`,
        `date: ${todayYmd()}`,
        `created: ${now}`,
        `modified: ${now}`,
        `icon: ${icon || "✍️"}`
    ];
    const body = text ? `\n${text}\n` : "\n";
    return `---\n${fm.join("\n")}\n---\n${body}`;
}

async function createPromptedEntry(fs, title, text, icon) {
    const fileName = await uniqueFilename(fs, sanitizeFilename(title));
    const content = buildEntryContent(title, text, icon);
    await fs.writeText(fileName, content);
    return fileName;
}

// ── Error boundary for inline editor ────────────────────────────────────────
class EditorErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }
    static getDerivedStateFromError(error) { return { error }; }
    componentDidCatch(error, info) { console.error("[prompted-journal] editor error:", error, info); }
    render() {
        if (this.state.error) {
            return h("div", { className: "p-6 text-center" },
                     h("p", { className: "text-sm text-red-300 mb-2" }, "Couldn't render the inline editor."),
                     h("p", { className: "text-xs text-gray-500 mb-4" }, String(this.state.error.message || this.state.error)),
                     h("button", { onClick: () => this.setState({ error: null }), className: "px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded mb-4" }, "Try again"),
                     h("p", { className: "text-xs text-gray-500" }, "You can still edit this note by clicking it in the sidebar.")
            );
        }
        return this.props.children;
    }
}

// ── Prompt picker ───────────────────────────────────────────────────────────
function PickerView(props) {
    const { ctx, prompts, onPick, onFreeWrite, onConfigure } = props;
    const [query, setQuery] = React.useState("");
    const [busy, setBusy] = React.useState(false);
    const [error, setError] = React.useState(null);

    const q = query.trim().toLowerCase();
    const filtered = q
    ? prompts.map((cat) => ({
        ...cat,
        prompts: (cat.prompts || []).filter((p) => p.title.toLowerCase().includes(q) || (p.text || "").toLowerCase().includes(q))
    })).filter((cat) => cat.prompts.length > 0)
    : prompts;

    const run = async (fn) => {
        setBusy(true);
        setError(null);
        try { await fn(); } catch (e) { setError(String(e?.message || e)); } finally { setBusy(false); }
    };

    return h("div", { className: "max-w-4xl mx-auto px-6 py-8" },
             h("div", { className: "flex items-center justify-between mb-6 gap-4 flex-wrap" },
               h("div", { className: "flex items-center gap-3 min-w-0" },
                 h("span", { className: "text-4xl flex-shrink-0 leading-none" }, ctx.icon || "✍️"),
                 h("div", { className: "min-w-0" },
                   h("h1", { className: "text-2xl font-bold text-gray-100 truncate" }, ctx.name || "Prompted Journal"),
                   h("p", { className: "text-xs text-gray-500 mt-0.5" }, "Pick a prompt to start writing")
                 )
               ),
               h("div", { className: "flex items-center gap-2 flex-shrink-0" },
                 h("button", { type: "button", onClick: () => run(onFreeWrite), disabled: busy, className: "flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded transition-colors font-medium" }, "✍️ Free write"),
                 h("button", { type: "button", onClick: onConfigure, className: "p-1.5 text-gray-500 hover:text-gray-200 hover:bg-[#2a3136] rounded transition-colors", title: "Configure prompts" }, "⚙️")
               )
             ),
             h("input", { type: "text", value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Search prompts…", className: "w-full bg-[#161a1d] border border-[#2a3136] rounded px-3 py-2 text-xs text-gray-200 outline-none focus:ring-1 focus:ring-blue-500 mb-6" }),
             error && h("div", { className: "mb-4 rounded-md border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-300 flex items-start gap-2" },
                        h("span", null, "⚠️"),
                        h("span", { className: "flex-1 break-words" }, error)
             ),
             filtered.map((cat) =>
             h("section", { key: cat.id, className: "mb-8" },
               h("div", { className: "flex items-center gap-2 mb-3" },
                 h("span", { className: "text-lg leading-none" }, cat.icon || "•"),
                 h("h2", { className: "text-[11px] font-semibold text-gray-400 uppercase tracking-[0.15em]" }, cat.label),
                 h("div", { className: "flex-1 h-px bg-[#2a3136]" }),
                 h("span", { className: "text-[10px] text-gray-600 tabular-nums" }, (cat.prompts || []).length)
               ),
               h("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" },
                 (cat.prompts || []).map((p, i) =>
                 h("button", { key: `${cat.id}-${i}`, type: "button", disabled: busy, onClick: () => run(() => onPick(cat, p)), className: "text-left rounded-lg border border-[#2a3136] bg-[#161a1d] hover:border-[#3a4147] hover:bg-[#1a1e21] disabled:opacity-50 transition-colors p-3 group min-h-[5rem] flex flex-col" },
                   h("div", { className: "text-sm font-medium text-gray-100 mb-1 truncate" }, p.title),
                   h("p", { className: "text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1" }, (p.text || "").split("\n")[0] || "(empty)")
                 )
                 )
               )
             )
             ),
             filtered.length === 0 && h("div", { className: "text-center py-12 text-sm text-gray-500 italic" }, 'No prompts match "' + q + '".')
    );
}

// ── Preview view ────────────────────────────────────────────────────────────
function PreviewView({ data, ctx, onBack, onStart }) {
    const { tempPath } = data;

    // Force the editor into read-only mode so you can't type or click
    React.useEffect(() => {
        const interval = setInterval(() => {
            const container = document.getElementById("preview-editor-container");
            if (container) {
                const editor = container.querySelector(".ProseMirror");
                if (editor) {
                    editor.setAttribute("contenteditable", "false");
                    editor.style.pointerEvents = "none"; // Prevents clicking/selecting blocks
                    editor.style.userSelect = "none";    // Prevents text highlighting
                    editor.style.cursor = "default";
                }
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return h("div", { className: "h-full flex flex-col bg-[#0f1315]" },
             // Top Nav (Matching the editor layout)
             h("div", { className: "flex items-center gap-2 px-4 py-2 border-b border-[#2a3136] bg-[#161a1d] flex-shrink-0" },
               h("button", { type: "button", onClick: onBack, className: "flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400 hover:text-gray-100 transition-colors" }, "← Back to prompts"),
               h("div", { className: "flex-1" }),
               h("span", { className: "text-[10px] text-gray-500 font-mono truncate max-w-[280px] uppercase tracking-wider" }, "Preview (Read Only)"),
               h("button", {
                   onClick: onStart,
                   className: "ml-4 flex items-center gap-1.5 px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors font-medium shadow-sm"
               }, "✍️ Start Writing")
             ),
             // The Real BlockNote Editor
             h("div", {
                 id: "preview-editor-container",
                 className: "flex-1 overflow-y-auto min-h-0",
                 // Block keyboard deletion just in case
                 onKeyDown: (e) => {
                     if (["Backspace", "Delete", "Enter"].includes(e.key)) {
                         e.preventDefault();
                         e.stopPropagation();
                     }
                 }
             },
             h(EditorErrorBoundary, null,
               h(selah.Editor, { path: tempPath, vaultPath: ctx.vaultPath })
             )
             )
    );
}

// ── Inline editor view ──────────────────────────────────────────────────────
function EditorView(props) {
    const { ctx, path, onBack } = props;
    const fileName = path.split(/[/\\]/).pop() || "note";
    return h("div", { className: "h-full flex flex-col" },
             h("div", { className: "flex items-center gap-2 px-4 py-2 border-b border-[#2a3136] bg-[#161a1d] flex-shrink-0" },
               h("button", { type: "button", onClick: onBack, className: "flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400 hover:text-gray-100 transition-colors" }, "← Back to prompts"),
               h("div", { className: "flex-1" }),
               h("span", { className: "text-[10px] text-gray-500 font-mono truncate max-w-[280px]", title: path }, fileName)
             ),
             h("div", { className: "flex-1 overflow-y-auto min-h-0" },
               h(EditorErrorBoundary, null,
                 h(selah.Editor, { path, vaultPath: ctx.vaultPath })
               )
             )
    );
}

// ── Auto-Resizing Textarea ──────────────────────────────────────────────────
function AutoResizeTextarea({ value, onChange, placeholder, className }) {
    const ref = React.useRef(null);

    const resize = () => {
        if (ref.current) {
            ref.current.style.height = '0px'; // Reset to 0 first for accurate measurement
            // Limit the height to 200px to prevent wild stretching
            ref.current.style.height = Math.min(ref.current.scrollHeight, 200) + 'px';
        }
    };

    React.useEffect(() => {
        resize();
        // Slight delay to ensure the modal has fully finished expanding
        const timer = setTimeout(resize, 50);
        return () => clearTimeout(timer);
    }, [value]);

    return h("textarea", {
        ref,
        value,
        onChange,
        placeholder,
        className,
        rows: 1,
        style: {
            overflowY: 'auto',
            resize: 'none',
            minHeight: '42px', // Never shrinks smaller than a single line
            maxHeight: '200px'
        }
    });
}

// ── Configuration panel ─────────────────────────────────────────────────────
function ConfigPanel() {
    const [categories, setCategories] = React.useState([]);
    // Views: "categories" | "prompts" | "questions" | "json"
    const [view, setView] = React.useState("categories");
    const [activeCatIdx, setActiveCatIdx] = React.useState(null);
    const [activePromptIdx, setActivePromptIdx] = React.useState(null);

    const [jsonText, setJsonText] = React.useState("");
    const [error, setError] = React.useState(null);
    const [saved, setSaved] = React.useState(false);

    React.useEffect(() => {
        const loaded = loadPrompts();
        setCategories(loaded);
        setJsonText(JSON.stringify(loaded, null, 2));
    }, []);

    const triggerSave = (newCats) => {
        setCategories(newCats);
        savePrompts(newCats);
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
    };

    const updateCategory = (idx, field, value) => {
        const next = [...categories];
        next[idx] = { ...next[idx], [field]: value };
        triggerSave(next);
    };

    const addCategory = () => {
        const next = [...categories, {
            id: "custom-" + Date.now(),
            label: "New Category",
            icon: "📌",
            prompts: []
        }];
        triggerSave(next);
        setActiveCatIdx(next.length - 1);
        setView("prompts");
    };

    const deleteCategory = (idx) => {
        if (!window.confirm("Delete this entire category and all its prompts?")) return;
        const next = categories.filter((_, i) => i !== idx);
        triggerSave(next);
        if (activeCatIdx === idx) {
            setActiveCatIdx(null);
            setView("categories");
        }
    };

    const addPrompt = (cIdx) => {
        const next = [...categories];
        next[cIdx] = {
            ...next[cIdx],
            prompts: [...next[cIdx].prompts, { title: "New Prompt", text: "Question 1\n\nQuestion 2\n" }]
        };
        triggerSave(next);
        setActivePromptIdx(next[cIdx].prompts.length - 1);
        setView("questions");
    };

    const updatePrompt = (cIdx, pIdx, field, value) => {
        const next = [...categories];
        const prompts = [...next[cIdx].prompts];
        prompts[pIdx] = { ...prompts[pIdx], [field]: value };
        next[cIdx] = { ...next[cIdx], prompts };
        triggerSave(next);
    };

    const deletePrompt = (cIdx, pIdx) => {
        if (!window.confirm("Delete this prompt and all its questions?")) return;
        const next = [...categories];
        next[cIdx] = {
            ...next[cIdx],
            prompts: next[cIdx].prompts.filter((_, i) => i !== pIdx)
        };
        triggerSave(next);
        if (activePromptIdx === pIdx) {
            setActivePromptIdx(null);
            setView("prompts");
        }
    };

    const reset = () => {
        const defaults = JSON.parse(JSON.stringify(DEFAULT_PROMPTS));
        setCategories(defaults);
        setJsonText(JSON.stringify(defaults, null, 2));
        savePrompts(defaults);
        setView("categories");
        setActiveCatIdx(null);
        setActivePromptIdx(null);
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
    };

    const switchToJson = () => {
        setJsonText(JSON.stringify(categories, null, 2));
        setView("json");
        setError(null);
    };

    const applyJson = () => {
        try {
            const parsed = JSON.parse(jsonText);
            if (!Array.isArray(parsed)) throw new Error("Must be an array.");
            for (const cat of parsed) {
                if (!cat.id || !cat.label) throw new Error("Each category needs id + label.");
                if (!Array.isArray(cat.prompts)) throw new Error('"' + cat.label + '" needs prompts array.');
            }
            setCategories(parsed);
            savePrompts(parsed);
            setView("categories");
            setError(null);
        } catch (e) {
            setError(String(e?.message || e));
        }
    };

    // ── Level 1: Categories ─────────────────────────────────────────────────
    const renderCategories = () => h("div", { className: "space-y-3" },
                                     h("div", { className: "flex items-center justify-between mb-4" },
                                       h("p", { className: "text-xs text-gray-400" }, "Manage your prompt categories."),
                                       h("div", { className: "flex gap-2" },
                                         h("button", { onClick: switchToJson, className: "px-3 py-1.5 text-xs bg-[#2a3136] hover:bg-[#30363d] text-gray-200 rounded" }, "View JSON"),
                                         h("button", { onClick: addCategory, className: "px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded" }, "+ Add Category")
                                       )
                                     ),
                                     categories.map((cat, i) => h("div", {
                                         key: cat.id,
                                         onClick: () => { setActiveCatIdx(i); setView("prompts"); },
                                                                  className: "flex items-center justify-between p-3 bg-[#1e2327] border border-[#2a3136] rounded-lg cursor-pointer hover:border-[#3a4147] transition-colors"
                                     },
                                     h("div", { className: "flex items-center gap-3" },
                                       h("span", { className: "text-xl" }, cat.icon),
                                       h("span", { className: "font-medium text-gray-100" }, cat.label),
                                       h("span", { className: "text-[10px] text-gray-500 bg-[#0f1315] px-2 py-0.5 rounded-full ml-2" }, (cat.prompts ? cat.prompts.length : 0) + " prompts")
                                     ),
                                     h("div", { className: "flex items-center gap-2" },
                                       h("button", {
                                           onClick: (e) => { e.stopPropagation(); deleteCategory(i); },
                                         className: "p-1.5 text-gray-500 hover:text-red-400 hover:bg-black/20 rounded transition-colors"
                                       }, "🗑️"),
                                       h("span", { className: "text-gray-500" }, "›")
                                     )
                                     )),
                                     h("div", { className: "pt-4 mt-4 border-t border-[#2a3136] flex justify-end" },
                                       h("button", { onClick: reset, className: "text-xs text-gray-500 hover:text-red-400" }, "Reset to defaults")
                                     )
    );

    // ── Level 2: Prompts inside a Category ──────────────────────────────────
    const renderPrompts = () => {
        const cat = categories[activeCatIdx];
        if (!cat) return null;

        const openEmojiPicker = (e) => {
            const pickerContainer = document.createElement("div");
            pickerContainer.className = "fixed z-[99999] bg-[#1e2327] border border-[#2a3136] rounded-lg shadow-2xl overflow-hidden";

            const rect = e.currentTarget.getBoundingClientRect();
            const W = 320;
            const H = 360;
            const left = Math.min(rect.left, window.innerWidth - W - 12);
            const top = Math.min(rect.bottom + 4, window.innerHeight - H - 12);

            pickerContainer.style.top = `${top}px`;
            pickerContainer.style.left = `${left}px`;

            const root = ReactDOM.createRoot(pickerContainer);
            root.render(h(selah.EmojiPicker, {
                theme: selah.currentEmojiTheme(),
                          onEmojiClick: (d) => {
                              updateCategory(activeCatIdx, "icon", d.emoji);
                              root.unmount();
                              pickerContainer.remove();
                          },
                          width: W,
                          height: H,
                          previewConfig: { showPreview: false }
            }));

            document.body.appendChild(pickerContainer);

            const close = (ev) => {
                if (!pickerContainer.contains(ev.target) && ev.target !== e.currentTarget) {
                    root.unmount();
                    pickerContainer.remove();
                    document.removeEventListener("mousedown", close);
                }
            };
            setTimeout(() => document.addEventListener("mousedown", close), 0);
        };

        return h("div", { className: "space-y-4 flex-1 flex flex-col min-h-0" },
                 // Top Nav
                 h("div", { className: "flex items-center justify-between mb-2" },
                   h("button", { onClick: () => setView("categories"), className: "text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium" }, "← Back to Categories"),
                   h("button", { onClick: () => deleteCategory(activeCatIdx), className: "text-xs text-red-400 hover:text-red-300 font-medium" }, "Delete Category")
                 ),

                 // Category Header Box
                 h("div", { className: "flex flex-col gap-3 p-4 bg-[#1e2327] border border-[#30363d] rounded-lg shadow-sm" },
                   h("div", { className: "flex items-center gap-3" },
                     h("button", {
                         onClick: openEmojiPicker,
                         className: "w-12 h-12 flex items-center justify-center text-2xl bg-[#0f1315] border border-[#30363d] rounded-lg hover:border-[#3a4147] transition-colors outline-none focus:ring-1 focus:ring-blue-500",
                         title: "Click to change icon"
                     }, cat.icon || "📌"),
                     h("div", { className: "flex-1 space-y-1" },
                       h("label", { className: "text-[10px] uppercase tracking-wider text-gray-500 font-semibold" }, "Category Title"),
                       h("input", {
                           value: cat.label,
                           onChange: (e) => updateCategory(activeCatIdx, "label", e.target.value),
                         className: "w-full bg-[#0f1315] border border-[#30363d] rounded-md px-3 py-2 text-sm font-semibold text-gray-100 outline-none focus:ring-1 focus:ring-blue-500",
                         placeholder: "Category Name"
                       })
                     )
                   )
                 ),

                 // Prompts List
                 h("div", { className: "space-y-3 max-h-[50vh] overflow-y-auto pr-2 pb-2" },
                   cat.prompts.map((p, pIdx) => h("div", {
                       key: pIdx,
                       onClick: () => { setActivePromptIdx(pIdx); setView("questions"); },
                                                  className: "flex flex-col bg-[#161a1d] border border-[#30363d] rounded-xl relative group shadow-sm hover:border-[#3a4147] transition-colors cursor-pointer p-4 overflow-hidden"
                   },
                   h("div", { className: "flex items-center justify-between" },
                     h("h3", { className: "font-bold text-gray-100" }, p.title || "Untitled Prompt"),
                     h("div", { className: "flex items-center gap-2" },
                       h("button", {
                           onClick: (e) => { e.stopPropagation(); deletePrompt(activeCatIdx, pIdx); },
                         className: "p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100",
                         title: "Delete Prompt"
                       }, "🗑️"),
                       h("span", { className: "text-gray-500" }, "›")
                     )
                   ),
                   h("p", { className: "text-xs text-gray-500 mt-1 line-clamp-2" },
                     (p.text || "").replace(/\n/g, " ")
                   )
                   ))
                 ),

                 // Add Prompt Button
                 h("button", {
                     onClick: () => addPrompt(activeCatIdx),
                   className: "w-full py-3 mt-2 text-sm font-medium text-gray-400 bg-transparent hover:bg-[#2a3136] hover:text-gray-200 border border-dashed border-[#30363d] hover:border-[#3a4147] rounded-lg transition-all flex items-center justify-center gap-2"
                 }, h("span", { className: "text-lg font-light" }, "+"), "Add New Prompt")
        );
    };

    // ── Level 3: Questions inside a Prompt ──────────────────────────────────
    const renderQuestions = () => {
        const cat = categories[activeCatIdx];
        if (!cat) return null;
        const p = cat.prompts[activePromptIdx];
        if (!p) return null;

        const textBlocks = (p.text || "").split(/\n\n+/);
        if (textBlocks.length === 0) textBlocks.push("");

        const updateBlock = (bIdx, val) => {
            const nextBlocks = [...textBlocks];
            nextBlocks[bIdx] = val;
            updatePrompt(activeCatIdx, activePromptIdx, "text", nextBlocks.join("\n\n"));
        };

        const deleteBlock = (bIdx) => {
            const nextBlocks = textBlocks.filter((_, i) => i !== bIdx);
            updatePrompt(activeCatIdx, activePromptIdx, "text", nextBlocks.length ? nextBlocks.join("\n\n") : "");
        };

        const addBlock = () => {
            const nextBlocks = [...textBlocks, ""];
            updatePrompt(activeCatIdx, activePromptIdx, "text", nextBlocks.join("\n\n"));
        };

        return h("div", { className: "space-y-4" },
                 // Top Nav
                 h("div", { className: "flex items-center justify-between mb-2" },
                   h("button", { onClick: () => setView("prompts"), className: "text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium" }, "← Back to Prompts"),
                   h("button", { onClick: () => deletePrompt(activeCatIdx, activePromptIdx), className: "text-xs text-red-400 hover:text-red-300 font-medium" }, "Delete Prompt")
                 ),

                 // Prompt Title
                 h("div", { className: "p-4 bg-[#1e2327] border border-[#30363d] rounded-lg shadow-sm" },
                   h("label", { className: "text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1 block" }, "Prompt Title"),
                   h("input", {
                       value: p.title,
                       onChange: (e) => updatePrompt(activeCatIdx, activePromptIdx, "title", e.target.value),
                     className: "w-full bg-[#0f1315] border border-[#30363d] rounded-md px-3 py-2 text-lg font-bold text-gray-100 outline-none focus:ring-1 focus:ring-blue-500",
                     placeholder: "Prompt Title Here..."
                   })
                 ),

                 // Questions List
                 h("div", { className: "space-y-2 flex-1 overflow-y-auto pr-2 pb-2" },
                   textBlocks.map((block, bIdx) => h("div", { key: bIdx, className: "flex items-start gap-2 group/sub" },
                                                     h("div", { className: "flex-1 bg-[#0f1315] border border-[#30363d] rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-sm" },
                                                       h(AutoResizeTextarea, {
                                                           value: block,
                                                           onChange: (e) => updateBlock(bIdx, e.target.value),
                                                         className: "w-full bg-transparent border-none text-sm text-gray-300 outline-none leading-relaxed p-3",
                                                         placeholder: "Write a question or context here..."
                                                       })
                                                     ),
                                                     h("button", {
                                                         onClick: () => deleteBlock(bIdx),
                                                       className: "p-2 mt-1 text-gray-500 hover:text-red-400 hover:bg-[#2a3136] rounded-md transition-colors opacity-50 group-hover/sub:opacity-100",
                                                       title: "Remove this question"
                                                     }, "✕")
                   ))
                 ),

                 // Add Question Button
                 h("button", {
                     onClick: addBlock,
                     className: "w-full py-3 mt-2 text-sm font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-dashed border-blue-500/30 hover:border-blue-500/50 rounded-lg transition-all flex items-center justify-center gap-2"
                 }, h("span", { className: "text-lg" }, "+"), "Add New Question")
        );
    };

    // ── JSON View ───────────────────────────────────────────────────────────
    const renderJson = () => h("div", { className: "space-y-3 flex-1 flex flex-col min-h-0" },
                               h("div", { className: "flex items-center justify-between mb-2 flex-shrink-0" },
                                 h("p", { className: "text-xs text-gray-400" }, "Copy this JSON to share your prompts with others."),
                                 h("button", { onClick: () => setView("categories"), className: "text-xs text-blue-400 hover:text-blue-300" }, "← Back to Visual Editor")
                               ),
                               h("textarea", {
                                   value: jsonText,
                                   onChange: (e) => setJsonText(e.target.value),
                                 spellCheck: false,
                                 className: "flex-1 w-full bg-[#0f1315] border border-[#30363d] rounded px-3 py-2 text-xs text-gray-200 outline-none focus:ring-1 focus:ring-blue-500 font-mono resize-none",
                                 style: { tabSize: 2 }
                               }),
                               error && h("div", { className: "text-xs text-red-400 bg-red-500/10 p-2 rounded flex-shrink-0" }, error),
                               h("button", {
                                   onClick: applyJson,
                                   className: "px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-medium w-full flex-shrink-0"
                               }, "Apply JSON Changes")
    );

    // ── Main Return ─────────────────────────────────────────────────────────
    return h("div", { className: "flex-1 flex flex-col min-h-0 relative w-full" },
             saved && h("div", { className: "absolute top-0 right-0 text-[10px] text-green-400 bg-green-500/10 px-2 py-1 rounded z-10" }, "Saved"),
             view === "categories" ? h("div", { className: "overflow-y-auto flex-1" }, renderCategories()) :
             view === "prompts" ? h("div", { className: "overflow-y-auto flex-1" }, renderPrompts()) :
             view === "questions" ? renderQuestions() :
             renderJson()
    );
}

// ── Global Settings Modal ───────────────────────────────────────────────────
let activeSettingsRoot = null;

window.openSettingsModal = function() {
    if (activeSettingsRoot) return;

    // Close native settings modal if it's open
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    setTimeout(() => {
        const container = document.createElement("div");
        document.body.appendChild(container);
        activeSettingsRoot = ReactDOM.createRoot(container);

        const handleClose = () => {
            if (activeSettingsRoot) {
                activeSettingsRoot.unmount();
                activeSettingsRoot = null;
                container.remove();
            }
        };

        const SettingsModal = () => h("div", {
            className: "fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm",
            onClick: handleClose // This closes the modal when clicking the dark background
        },
        h("div", {
            className: "bg-[#1e2327] border border-[#2a3136] rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden",
          onClick: (e) => e.stopPropagation() // This stops the click from closing it when clicking inside
        },
        h("div", { className: "flex items-center justify-between px-5 py-4 border-b border-[#2a3136] bg-[#1a1e21] flex-shrink-0" },
          h("h2", { className: "text-sm font-semibold text-gray-100 flex items-center gap-2" },
            h("span", { className: "text-lg" }, "⚙️"),
            h("span", null, "Configure Prompted Journal")
          ),
          h("button", {
              onClick: handleClose,
              className: "text-gray-500 hover:text-gray-300 p-1.5 rounded-md hover:bg-[#2a3136] transition-colors"
          }, "✕")
        ),
        h("div", { className: "p-5 bg-[#0f1315] flex-1 flex flex-col overflow-hidden" },
          h(ConfigPanel)
        ),
        h("div", { className: "p-4 border-t border-[#2a3136] bg-[#1a1e21] flex justify-end flex-shrink-0" },
          h("button", {
              onClick: handleClose,
              className: "px-6 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors shadow-sm"
          }, "Done")
        )
        )
        );

        activeSettingsRoot.render(h(SettingsModal));
    }, 100);
};

// ── App shell ───────────────────────────────────────────────────────────────
function App(props) {
    const { ctx } = props;
    const [prompts, setPrompts] = React.useState(DEFAULT_PROMPTS);
    const [view, setView] = React.useState("picker"); // "picker", "editor", "list"
    const [selectedPath, setSelectedPath] = React.useState(null);
    const [entries, setEntries] = React.useState([]);
    const [ctxMenu, setCtxMenu] = React.useState(null); // { x, y, entry }
    const [previewData, setPreviewData] = React.useState(null);

    const loadEntries = React.useCallback(async () => {
        try {
            const files = await ctx.fs.list("");
            const notes = files.filter(f => f.endsWith(".selah") && !f.startsWith("."));
            const items = [];
            for (const f of notes) {
                const raw = await ctx.fs.readText(f);
                if (raw) {
                    const titleMatch = raw.match(/title:\s*"?([^"\n]+)"?/);
                    const title = titleMatch ? titleMatch[1] : f.replace(/\.selah$/, "");

                    const dateMatch = raw.match(/date:\s*(\d{4}-\d{2}-\d{2})/);
                    const date = dateMatch ? dateMatch[1] : "";

                    const iconMatch = raw.match(/icon:\s*"?([^"\n]+)"?/);
                    const icon = iconMatch ? iconMatch[1] : "📝";

                    items.push({ fileName: f, title, date, icon });
                }
            }
            items.sort((a, b) => b.date.localeCompare(a.date) || b.fileName.localeCompare(a.fileName));
            setEntries(items);
        } catch (e) { console.error("[prompted-journal] loadEntries failed:", e); }
    }, [ctx.fs]);

    React.useEffect(() => {
        setPrompts(loadPrompts());
        loadEntries();
        const refresh = () => setPrompts(loadPrompts());
        const onFileChanged = () => loadEntries();

        window.addEventListener("settings-changed", refresh);
        window.addEventListener("file-changed", onFileChanged);
        window.addEventListener("folder-changed", onFileChanged);

        return () => {
            window.removeEventListener("settings-changed", refresh);
            window.removeEventListener("file-changed", onFileChanged);
            window.removeEventListener("folder-changed", onFileChanged);
        };
    }, [loadEntries]);

    React.useEffect(() => {
        if (!ctxMenu) return;
        const close = () => setCtxMenu(null);
        document.addEventListener("click", close);
        document.addEventListener("contextmenu", close);
        return () => {
            document.removeEventListener("click", close);
            document.removeEventListener("contextmenu", close);
        };
    }, [ctxMenu]);

    React.useEffect(() => {
        return () => {
            if (previewData && previewData.tempFileName) {
                ctx.fs.remove(previewData.tempFileName).catch(() => {});
            }
        };
    }, [previewData]);

    // ── Change Icon Logic ───────────────────────────────────────────────────
    let activePicker = null;
    const openIconPicker = (entry, x, y) => {
        if (activePicker) {
            activePicker.remove();
            activePicker = null;
        }

        const W = 320;
        const H = 360;
        const left = Math.min(x, window.innerWidth - W - 12);
        const top = Math.min(y, window.innerHeight - H - 12);

        const pickerContainer = document.createElement("div");
        pickerContainer.className = "fixed z-[9999] bg-[#1e2327] border border-[#2a3136] rounded-lg shadow-2xl overflow-hidden";
        pickerContainer.style.top = `${top}px`;
        pickerContainer.style.left = `${left}px`;

        const root = ReactDOM.createRoot(pickerContainer);
        root.render(h(selah.EmojiPicker, {
            theme: selah.currentEmojiTheme(),
                      onEmojiClick: async (d) => {
                          root.unmount();
                          pickerContainer.remove();
                          activePicker = null;
                          await updateIcon(entry.fileName, d.emoji);
                      },
                      width: 320,
                      height: 360,
                      previewConfig: { showPreview: false }
        }));

        document.body.appendChild(pickerContainer);
        activePicker = pickerContainer;

        // Close on outside click
        const close = (ev) => {
            if (!pickerContainer.contains(ev.target)) {
                root.unmount();
                pickerContainer.remove();
                activePicker = null;
                document.removeEventListener("mousedown", close);
            }
        };
        setTimeout(() => document.addEventListener("mousedown", close), 0);
    };

    const updateIcon = async (fileName, emoji) => {
        const raw = await ctx.fs.readText(fileName);
        if (!raw) return;

        let newRaw = raw;
        if (/^icon:/m.test(raw)) {
            newRaw = raw.replace(/^icon:.*$/m, `icon: ${emoji}`);
        } else {
            newRaw = raw.replace(/^---\r?\n/, `---\nicon: ${emoji}\n`);
        }

        await ctx.fs.writeText(fileName, newRaw);
        loadEntries();
    };

    const deleteEntry = async (entry) => {
        if (!window.confirm(`Are you sure you want to move "${entry.title}" to the trash?`)) return;

        try {
            await ctx.fs.remove(entry.fileName); // Moves to system trash via Selah's API
            if (selectedPath === entry.fileName) {
                setSelectedPath(null);
                setView("picker");
            }
            loadEntries();
        } catch (e) {
            alert("Failed to delete note: " + e.message);
        }
    };

    // ── Render Custom Sidebar ───────────────────────────────────────────────
    React.useEffect(() => {
        if (!ctx.sidebarContainer) return;
        const sb = ctx.sidebarContainer;

        const renderSidebar = () => {
            sb.innerHTML = `
            <div class="p-2 space-y-1 h-full flex flex-col">
            <div class="text-[10px] uppercase tracking-wider text-gray-500 px-3 py-1 mt-2">Journal Menu</div>
            <button id="sb-prompts" class="w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors text-left cursor-pointer">
            <span class="text-base leading-none">✨</span> Prompts
            </button>
            <button id="sb-entries" class="w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors text-left cursor-pointer">
            <span class="text-base leading-none">📚</span> All Entries
            </button>
            <div class="flex-1 overflow-y-auto mt-4 space-y-0.5" id="sb-entry-list"></div>
            </div>
            `;

            const p = sb.querySelector("#sb-prompts");
            const e = sb.querySelector("#sb-entries");
            const baseClass = "w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors text-left cursor-pointer ";
            const activeClass = "bg-[#2a3136] text-gray-100";
            const inactiveClass = "text-gray-400 hover:text-gray-100 hover:bg-[#1e2327]";

            p.className = baseClass + (view === "picker" ? activeClass : inactiveClass);
            e.className = baseClass + (view === "list" ? activeClass : inactiveClass);

            p.onclick = () => setView("picker");
            e.onclick = () => setView("list");

            const list = sb.querySelector("#sb-entry-list");
            list.innerHTML = "";

            entries.forEach(entry => {
                const item = document.createElement("div");
                const isActive = view === "editor" && selectedPath === entry.fileName;
                item.className = `w-full flex items-center gap-2 px-3 py-1.5 rounded transition-colors text-left group cursor-pointer ${isActive ? "bg-[#2a3136]" : "hover:bg-[#1e2327]"}`;

                const iconSpan = document.createElement("span");
                iconSpan.className = "text-base flex-shrink-0 w-5 text-center";
                iconSpan.innerText = entry.icon;

                const textDiv = document.createElement("div");
                textDiv.className = "flex-1 min-w-0 flex flex-col";
                textDiv.innerHTML = `
                <span class="text-sm truncate text-gray-200">${entry.title}</span>
                ${entry.date ? `<span class="text-[10px] text-gray-500">${formatDate(entry.date)}</span>` : ""}
                `;

                item.appendChild(iconSpan);
                item.appendChild(textDiv);

                item.onclick = () => {
                    setSelectedPath(entry.fileName);
                    setView("editor");
                };

                item.oncontextmenu = (ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    setCtxMenu({ x: ev.clientX, y: ev.clientY, entry });
                };

                list.appendChild(item);
            });
        };

        renderSidebar();
        return () => {
            if (activePicker) { activePicker.remove(); activePicker = null; }
            // Note: we don't clear sb.innerHTML on unmount so the sidebar stays visible on the Home screen
        };
    }, [view, selectedPath, entries, ctx.sidebarContainer]);

    const handlePick = async (cat, prompt) => {
        if (previewData && previewData.tempFileName) {
            try { await ctx.fs.remove(previewData.tempFileName); } catch (e) {}
        }

        const tempFileName = ".__preview__.selah";
        const content = buildEntryContent(prompt.title, prompt.text || "", cat.icon);
        await ctx.fs.writeText(tempFileName, content);

        const tempPath = `${ctx.dir.replace(/\\/g, "/")}/${tempFileName}`;
        setPreviewData({ cat, prompt, tempPath, tempFileName });
        setView("preview");
    };

    const handleFreeWrite = async () => {
        const now = new Date();
        const title = "Free Write — " + now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const fileName = await createPromptedEntry(ctx.fs, title, "", "✍️");

        // Tell Selah's native sidebar to refresh
        window.dispatchEvent(new CustomEvent("file-changed", { detail: { path: fileName } }));
        window.dispatchEvent(new CustomEvent("folder-changed", { detail: { path: ctx.dir } }));

        setSelectedPath(fileName);
        setView("editor");
        loadEntries();
    };

    const fullPath = selectedPath ? `${ctx.dir.replace(/\\/g, "/")}/${selectedPath}` : null;

    // ── Context Menu UI ─────────────────────────────────────────────────────
    const contextMenuUI = ctxMenu ? h("div", {
        className: "fixed z-[9999] bg-[#1e2327] border border-[#2a3136] rounded-md shadow-xl py-1 w-48 text-sm",
        style: { top: ctxMenu.y, left: ctxMenu.x },
        onClick: (e) => e.stopPropagation()
    },
    h("button", {
        onClick: () => {
            const entry = ctxMenu.entry;
            const x = ctxMenu.x;
            const y = ctxMenu.y;
            setCtxMenu(null);
            openIconPicker(entry, x, y);
        },
      className: "w-full text-left px-3 py-1.5 text-gray-200 hover:bg-[#2a3136] transition-colors flex items-center gap-2"
    }, "😀 Change Icon"),
    h("button", {
        onClick: () => {
            const entry = ctxMenu.entry;
            setCtxMenu(null);
            deleteEntry(entry);
        },
      className: "w-full text-left px-3 py-1.5 text-red-400 hover:bg-[#2a3136] transition-colors flex items-center gap-2 border-t border-[#2a3136]"
    }, "🗑️ Delete Note")
    ) : null;

    // ── Main View Render ────────────────────────────────────────────────────
    return h("div", { className: "h-full flex flex-col" },
             contextMenuUI,
             view === "editor" && fullPath ?
             h(EditorView, { ctx, path: fullPath, onBack: () => setView("picker") })
             : view === "preview" && previewData ?
             h(PreviewView, {
                 data: previewData,
                 ctx: ctx,
                 onBack: async () => {
                     if (previewData.tempFileName) {
                         try { await ctx.fs.remove(previewData.tempFileName); } catch (e) {}
                     }
                     setPreviewData(null);
                     setView("picker");
                 },
                 onStart: async () => {
                     try {
                         const { prompt, tempFileName } = previewData;

                         // 1. Read the hidden file (in case you typed anything)
                         let content = "";
                         try { content = await ctx.fs.readText(tempFileName); } catch (e) {}

                         // 2. Create the real file
                         const fileName = await uniqueFilename(ctx.fs, sanitizeFilename(prompt.title));
                         if (!content) {
                             content = buildEntryContent(prompt.title, prompt.text || "", previewData.cat.icon);
                         }

                         // Write the real file
                         await ctx.fs.writeText(fileName, content);

                         // Tell Selah's native sidebar to refresh
                         window.dispatchEvent(new CustomEvent("file-changed", { detail: { path: fileName } }));
                         window.dispatchEvent(new CustomEvent("folder-changed", { detail: { path: ctx.dir } }));

                         // Give the file system a tiny moment to register the new file
                         await new Promise(r => setTimeout(r, 100));

                         // 3. Clean up the hidden file
                         try { await ctx.fs.remove(tempFileName); } catch (e) {}

                         // 4. Open the real file and refresh sidebar
                         setPreviewData(null);
                         setSelectedPath(fileName);
                         setView("editor");
                         await loadEntries(); // Await so the sidebar updates instantly
                     } catch (err) {
                         console.error("Save failed:", err);
                         alert("Failed to save entry: " + err.message);
                     }
                 }
             })
             : view === "list" ?
             h("div", { className: "p-8 max-w-4xl mx-auto w-full h-full flex flex-col overflow-y-auto" },
               h("h1", { className: "text-2xl font-bold text-gray-100 mb-6 flex items-center gap-2" }, "📚 All Entries"),
               h("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" },
                 entries.map(entry =>
                 h("button", {
                     key: entry.fileName,
                     onClick: () => { setSelectedPath(entry.fileName); setView("editor"); },
                   className: "text-left rounded-lg border border-[#2a3136] bg-[#161a1d] hover:border-[#3a4147] p-4 flex flex-col transition-colors"
                 },
                 h("div", { className: "flex items-center gap-2 mb-1" },
                   h("span", { className: "text-xl" }, entry.icon),
                   h("span", { className: "text-sm font-semibold text-gray-100" }, entry.title)
                 ),
                 h("span", { className: "text-xs text-gray-500 mt-1" }, formatDate(entry.date))
                 )
                 )
               )
             )
             : h(PickerView, { ctx, prompts, onPick: handlePick, onFreeWrite: handleFreeWrite, onConfigure: () => window.openSettingsModal() })
    );
}

// ── Register the category type ──────────────────────────────────────────────
selah.registerCategoryType({
    id: "prompted",
    label: "Prompted Journal",
    icon: "✍️",
    description: "Journal with prompts, questions, and free-form writing.",
    layout: "full",
    render: (container, ctx) => {
        const root = ReactDOM.createRoot(container);
        root.render(h(App, { ctx }));
        return () => { try { root.unmount(); } catch {} };
    }
});

// ── Register configuration panel (Settings → Plugins → Configure) ───────────
selah.registerConfiguration((container) => {
    const root = ReactDOM.createRoot(container);

    // Automatically open our beautiful full-screen window
    setTimeout(() => window.openSettingsModal(), 50);

    const ConfigTrigger = () => h("div", { className: "p-6 flex flex-col items-center justify-center text-center gap-4 bg-[#1e2327] border border-[#2a3136] rounded-lg" },
                                  h("p", { className: "text-sm text-gray-300" }, "The configuration interface opens as a standalone window."),
                                  h("button", {
                                      onClick: () => window.openSettingsModal(),
                                    className: "px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-medium shadow-sm transition-colors"
                                  }, "Open Configuration Window")
    );

    root.render(h(ConfigTrigger));
    return () => { try { root.unmount(); } catch {} };
});
