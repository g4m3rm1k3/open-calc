const fs = require('fs');
const path = require('path');

const b1bVideos = [
  {
    target: "src/content/chapter-1/00-intro-limits.js",
    video: {
      id: "VideoEmbed",
      title: "Essence of Calculus, Chapter 1: The Paradox of the Derivative",
      props: { url: "https://www.youtube.com/embed/9vKqVkMQHKk" }
    }
  },
  {
    target: "src/content/chapter-2/01-differentiation-rules.js",
    video: {
      id: "VideoEmbed",
      title: "Essence of Calculus, Chapter 2: Derivative formulas through geometry",
      props: { url: "https://www.youtube.com/embed/S0_qX4VJhMQ" }
    }
  },
  {
    target: "src/content/chapter-2/02-chain-rule.js",
    video: {
      id: "VideoEmbed",
      title: "Essence of Calculus, Chapter 3: Visualizing the chain rule and product rule",
      props: { url: "https://www.youtube.com/embed/YG15m2VwSjA" }
    }
  },
  {
    target: "src/content/chapter-2/04-exp-log-derivatives.js",
    video: {
      id: "VideoEmbed",
      title: "Essence of Calculus, Chapter 4: What's so special about Euler's number e?",
      props: { url: "https://www.youtube.com/embed/m2MIpDrF7Es" }
    }
  },
  {
    target: "src/content/chapter-2/05-implicit-differentiation.js",
    video: {
      id: "VideoEmbed",
      title: "Essence of Calculus, Chapter 5: Implicit differentiation, what's going on here?",
      props: { url: "https://www.youtube.com/embed/qb40J4N1fa4" }
    }
  },
  {
    target: "src/content/chapter-1/00-intro-limits.js",
    video: {
      id: "VideoEmbed",
      title: "Essence of Calculus, Chapter 6: Limits",
      props: { url: "https://www.youtube.com/embed/kfF40MiS7zA" }
    }
  },
  {
    target: "src/content/chapter-4/00-area-accumulation.js",
    video: {
      id: "VideoEmbed",
      title: "Essence of Calculus, Chapter 7: Integration and the fundamental theorem of calculus",
      props: { url: "https://www.youtube.com/embed/rfG8ce4nNh0" }
    }
  },
  {
    target: "src/content/chapter-4/01-riemann-sums.js",
    video: {
      id: "VideoEmbed",
      title: "Essence of Calculus, Chapter 8: What does area have to do with slope?",
      props: { url: "https://www.youtube.com/embed/FnJqaIESC2s" }
    }
  },
  {
    target: "src/content/chapter-3/03-curve-sketching.js",
    video: {
      id: "VideoEmbed",
      title: "Essence of Calculus, Chapter 9: Higher order derivatives",
      props: { url: "https://www.youtube.com/embed/blcC0sBnmUE" }
    }
  },
  {
    target: "src/content/chapter-5/04-taylor-maclaurin.js",
    video: {
      id: "VideoEmbed",
      title: "Essence of Calculus, Chapter 10: Taylor series",
      props: { url: "https://www.youtube.com/embed/3d6DsjIBzJ4" }
    }
  }
];

function injectVideo(targetPath, videoObj) {
    if (!fs.existsSync(targetPath)) {
        console.log("File not found:", targetPath);
        return;
    }
    let content = fs.readFileSync(targetPath, 'utf8');

    // Create string notation for JSON object
    const injectStr = `{\n        id: 'VideoEmbed',\n        title: "${videoObj.title}",\n        props: { url: "${videoObj.props.url}" }\n      },`;

    // Inject right after visualizations: [
    if (content.includes('visualizations: [')) {
        content = content.replace(/visualizations:\s*\[/, `visualizations: [\n      ${injectStr}`);
    } else if (content.includes('intuition: {')) {
        content = content.replace(/intuition:\s*\{/, `intuition: {\n    visualizations: [\n      ${injectStr}\n    ],`);
    } else {
        console.log("Could not find insertion point in", targetPath);
        return;
    }

    fs.writeFileSync(targetPath, content, 'utf8');
    console.log("Injected 3B1B video into", targetPath);
}

b1bVideos.forEach(v => injectVideo(v.target, v.video));
