import { COMPONENTS, BODY_THEMES } from "./componentLibrary";

// Helper to deeply clone templates and rewrite IDs so they are unique
function instantiateTemplate(componentId, idPrefix) {
  const comp = COMPONENTS.find(c => c.id === componentId);
  if (!comp) return [];
  
  // Clone the template
  const elements = JSON.parse(JSON.stringify(comp.template));
  
  // Rewrite IDs
  const idMap = {};
  elements.forEach((el, index) => {
    const oldId = el.id;
    const newId = `${idPrefix}_${index}`;
    idMap[oldId] = newId;
    el.id = newId;
  });
  
  // Update parentIds
  elements.forEach(el => {
    if (el.parentId && idMap[el.parentId]) {
      el.parentId = idMap[el.parentId];
    }
  });
  
  return elements;
}

export function generateExampleProject() {
  const nav = instantiateTemplate("nav", "nav");
  const hero = instantiateTemplate("hero", "hero");
  
  // Three Column feature section
  const threeCol = instantiateTemplate("container", "threecol");
  // Set layout to grid 3-col
  threeCol[0].styles.display = "grid";
  threeCol[0].styles.gridTemplateColumns = "repeat(3, 1fr)";
  threeCol[0].styles.gap = "32px";
  threeCol[0].styles.border = "none";
  threeCol[0].styles.boxShadow = "none";
  threeCol[0].styles.backgroundColor = "transparent";

  const card1 = instantiateTemplate("card", "card1");
  const card2 = instantiateTemplate("card", "card2");
  const card3 = instantiateTemplate("card", "card3");
  
  card1.forEach(e => { if (e.parentId === null) e.parentId = threeCol[0].id; });
  card2.forEach(e => { if (e.parentId === null) e.parentId = threeCol[0].id; });
  card3.forEach(e => { if (e.parentId === null) e.parentId = threeCol[0].id; });

  // Two column testimonial
  const twoCol = instantiateTemplate("two-column", "twocol");
  const testimonial1 = instantiateTemplate("testimonial", "test1");
  const testimonial2 = instantiateTemplate("testimonial", "test2");
  
  const col1 = twoCol.find(e => e.order === 0 && e.parentId === twoCol[0].id);
  const col2 = twoCol.find(e => e.order === 1 && e.parentId === twoCol[0].id);
  
  if (col1) testimonial1.forEach(e => { if (e.parentId === null) e.parentId = col1.id; });
  if (col2) testimonial2.forEach(e => { if (e.parentId === null) e.parentId = col2.id; });

  // Adjust hero content
  hero.find(e => e.tag === "h1").content = "Unleash Your Creativity";
  hero.find(e => e.tag === "p").content = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.";
  
  // Adjust card 1 content
  if (card1.find(e => e.tag === "h3")) card1.find(e => e.tag === "h3").content = "Intuitive Design";
  if (card1.find(e => e.tag === "p")) card1.find(e => e.tag === "p").content = "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.";
  
  // Adjust card 2 content
  if (card2.find(e => e.tag === "h3")) card2.find(e => e.tag === "h3").content = "Lightning Fast";
  if (card2.find(e => e.tag === "p")) card2.find(e => e.tag === "p").content = "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem.";

  // Adjust card 3 content
  if (card3.find(e => e.tag === "h3")) card3.find(e => e.tag === "h3").content = "Scalable Architecture";
  if (card3.find(e => e.tag === "p")) card3.find(e => e.tag === "p").content = "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt.";

  // Adjust testimonials
  if (testimonial1.find(e => e.tag === "p")) testimonial1.find(e => e.tag === "p").content = "“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Amazing experience!”";
  if (testimonial1.find(e => e.tag === "h3")) testimonial1.find(e => e.tag === "h3").content = "Sarah Jenkins, CTO";

  if (testimonial2.find(e => e.tag === "p")) testimonial2.find(e => e.tag === "p").content = "“Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.”";
  if (testimonial2.find(e => e.tag === "h3")) testimonial2.find(e => e.tag === "h3").content = "Michael Chen, Lead Designer";

  const pricing = instantiateTemplate("pricing", "pricing");
  const pricingContainer = {
    id: "pricing_wrapper",
    tag: "div",
    parentId: null,
    order: 4,
    content: "",
    attrs: { id: "", class: "" },
    styles: { display: "flex", justifyContent: "center", padding: "64px 24px" },
    mediaQueries: []
  };
  pricing.forEach(e => { if (e.parentId === null) e.parentId = pricingContainer.id; });
  if (pricing.find(e => e.tag === "h3")) pricing.find(e => e.tag === "h3").content = "Pro Plan";
  if (pricing.find(e => e.tag === "h2")) pricing.find(e => e.tag === "h2").content = "$49/mo";

  return {
    bodyStyles: BODY_THEMES.find(t => t.id === "body-slate").styles,
    elements: [
      ...nav,
      ...hero,
      ...threeCol,
      ...card1,
      ...card2,
      ...card3,
      ...twoCol,
      ...testimonial1,
      ...testimonial2,
      pricingContainer,
      ...pricing
    ].map((el, i) => {
      if (el.parentId === null) el.order = i; // simple ordering for roots
      return el;
    })
  };
}
