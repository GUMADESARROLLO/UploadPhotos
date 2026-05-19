import { c as createComponent } from './astro-component_Cb5JI4XL.mjs';
import 'piccolore';
import { k as createRenderInstruction, n as renderHead, p as renderSlot, q as renderTemplate, m as maybeRenderHead } from './server_AahBSjhV.mjs';
import 'clsx';

async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = "";
  if (inlined != null) {
    if (inlined) {
      content = `<script type="module">${inlined}</script>`;
    }
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"></script>`;
  }
  return createRenderInstruction({ type: "script", id, content });
}

const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Layout;
  const { title } = Astro2.props;
  return renderTemplate`<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="theme-color" content="#4a3b32"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><title>${title} | Álbum de Boda</title>${renderHead()}</head> <body class="bg-wedding-cream text-wedding-dark min-h-screen font-sans"> ${renderSlot($$result, $$slots["default"])} ${renderScript($$result, "E:/Documents/MarangeloDev/UploadPhotos/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "E:/Documents/MarangeloDev/UploadPhotos/src/layouts/Layout.astro", void 0);

const $$Navbar = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<nav class="bg-wedding-ink text-wedding-cream px-6 py-4 shadow-lg"> <div class="max-w-6xl mx-auto flex items-center justify-between"> <a href="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity"> <span class="text-2xl">💍</span> <span class="text-xl font-semibold tracking-wide font-serif">Álbum de Boda</span> </a> <div class="flex items-center gap-6"> <span id="welcomeUser" class="text-wedding-gold text-sm font-medium hidden"></span> <div class="flex items-center gap-4 text-sm font-medium"> <a href="/upload" class="px-3 py-1.5 rounded transition-colors hover:text-wedding-gold" id="navUpload">
Subir Fotos
</a> <a href="/albums" class="px-3 py-1.5 rounded transition-colors hover:text-wedding-gold" id="navAlbums">
Álbumes
</a> <button id="logoutBtn" class="px-3 py-1.5 rounded transition-colors text-red-300 hover:text-red-200 hover:bg-red-900/30 cursor-pointer hidden">
Cerrar sesión
</button> </div> </div> </div> ${renderScript($$result, "E:/Documents/MarangeloDev/UploadPhotos/src/components/Navbar.astro?astro&type=script&index=0&lang.ts")} </nav>`;
}, "E:/Documents/MarangeloDev/UploadPhotos/src/components/Navbar.astro", void 0);

export { $$Layout as $, $$Navbar as a };
