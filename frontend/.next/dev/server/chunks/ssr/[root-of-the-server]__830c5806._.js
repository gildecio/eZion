module.exports = [
"[externals]/react/jsx-runtime [external] (react/jsx-runtime, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react/jsx-runtime", () => require("react/jsx-runtime"));

module.exports = mod;
}),
"[externals]/react [external] (react, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react", () => require("react"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/react-dom [external] (react-dom, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react-dom", () => require("react-dom"));

module.exports = mod;
}),
"[project]/components/Dropdown.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Dropdown
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-runtime [external] (react/jsx-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [ssr] (ecmascript)");
;
;
;
function Dropdown({ label, href, items = [], className = '' }) {
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const ref = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        function onDocClick(e) {
            if (!ref.current) return;
            if (!ref.current.contains(e.target)) setOpen(false);
        }
        function onEsc(e) {
            if (e.key === 'Escape') setOpen(false);
        }
        document.addEventListener('click', onDocClick);
        document.addEventListener('keydown', onEsc);
        return ()=>{
            document.removeEventListener('click', onDocClick);
            document.removeEventListener('keydown', onEsc);
        };
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__["jsxs"])("div", {
        ref: ref,
        className: `nav-item has-dropdown ${open ? 'open' : ''} ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__["jsx"])("div", {
                className: "nav-link-wrap",
                children: items && items.length > 0 ? // main label becomes a toggle button when there are subitems
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__["jsx"])("button", {
                    type: "button",
                    className: "nav-link nav-link-toggle",
                    "aria-expanded": open,
                    "aria-haspopup": "true",
                    onClick: (e)=>{
                        e.stopPropagation();
                        setOpen((s)=>!s);
                    },
                    children: label
                }) : href ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: href,
                    className: "nav-link",
                    children: label
                }) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__["jsx"])("span", {
                    className: "nav-link",
                    children: label
                })
            }),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__["jsx"])("div", {
                className: "dropdown-menu",
                role: "menu",
                children: items.map((it)=>it.items ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__["jsx"])("div", {
                        className: "dropdown-item has-submenu",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__["jsx"])(Dropdown, {
                            label: it.label,
                            href: it.href,
                            items: it.items,
                            className: "submenu"
                        })
                    }, it.label) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: it.href,
                        className: `dropdown-item`,
                        onClick: ()=>setOpen(false),
                        children: it.label
                    }, it.label))
            })
        ]
    });
}
}),
"[project]/components/Sidebar.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Sidebar
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-runtime [external] (react/jsx-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Dropdown$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Dropdown.js [ssr] (ecmascript)");
;
;
;
;
const items = [
    {
        href: '/',
        label: 'Home'
    }
];
function Sidebar() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__["jsxs"])("header", {
        className: "sidebar top-nav",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__["jsx"])("div", {
                className: "brand",
                children: "eZion"
            }),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__["jsxs"])("nav", {
                className: "nav",
                children: [
                    items.map((it)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: it.href,
                            className: `nav-item ${router.pathname === it.href ? 'active' : ''}`,
                            children: it.label
                        }, it.label)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Dropdown$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                        label: "Vendas",
                        href: "/vendas",
                        items: [
                            {
                                href: '/vendas/clientes',
                                label: 'Clientes'
                            },
                            {
                                href: '/vendas/pedidos',
                                label: 'Pedidos'
                            }
                        ],
                        className: `${router.pathname.startsWith('/vendas') ? 'active' : ''}`
                    })
                ]
            }),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__["jsx"])("div", {
                className: "top-nav-actions",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__["jsxs"])("div", {
                    className: "user",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__["jsx"])("div", {
                            className: "avatar",
                            children: "EZ"
                        }),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__["jsx"])("div", {
                            className: "user-info",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__["jsx"])("div", {
                                className: "user-name",
                                children: "Gildecio"
                            })
                        })
                    ]
                })
            })
        ]
    });
}
}),
"[project]/components/Layout.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Layout
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-runtime [external] (react/jsx-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Sidebar$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Sidebar.js [ssr] (ecmascript)");
;
;
function Layout({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__["jsxs"])("div", {
        className: "app",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Sidebar$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {}),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__["jsx"])("div", {
                className: "main",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__["jsx"])("div", {
                    className: "container",
                    children: children
                })
            })
        ]
    });
}
}),
"[project]/pages/_app.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>App
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-runtime [external] (react/jsx-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Layout$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Layout.js [ssr] (ecmascript)");
;
;
;
function App({ Component, pageProps }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Layout$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$runtime$2c$__cjs$29$__["jsx"])(Component, {
            ...pageProps
        })
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__830c5806._.js.map