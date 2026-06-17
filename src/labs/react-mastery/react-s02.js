export const lesson = {
  id: 'react-s02',
  series: { id: 'react-mastery', title: 'React 0 to Mastery' },
  title: '2. JSX & Styling',
  language: 'react',
  checkpoints: [
    { id: 'cp-jsx', label: 'Introduction to JSX' },
    { id: 'cp-styles', label: 'Inline Styles' },
    { id: 'cp-classes', label: 'CSS Classes' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      text: 'Writing `React.createElement` for every single element gets exhausting quickly. That is why JSX was invented.\n\nJSX allows us to write HTML-like syntax directly inside JavaScript. Behind the scenes, a tool like Babel transforms every JSX tag back into a `React.createElement` call.',
      code: `function Welcome() {
  // This looks like HTML, but it's actually JSX!
  return (
    <div>
      <h1>Hello, JSX!</h1>
      <p>This is much easier to read and write.</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Welcome />);
`,
    },
    {
      type: 'checkpoint',
      id: 'cp-jsx',
    },
    {
      type: 'narration',
      id: 'step1-styles',
      text: 'In standard HTML, you write styles as a string: `style="color: red; margin-top: 10px"`. In JSX, the `style` attribute expects a JavaScript object, and properties are written in camelCase instead of kebab-case.',
      code: `function StyledCard() {
  // Notice the double curly braces: 
  // The outer {} tells JSX we are passing a JavaScript value.
  // The inner {} is the actual JavaScript object.
  return (
    <div style={{
      backgroundColor: '#1e293b',
      color: '#f8fafc',
      padding: '2rem',
      borderRadius: '12px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
      fontFamily: 'sans-serif',
      maxWidth: '300px',
      margin: '40px auto'
    }}>
      <h2 style={{ marginTop: 0, color: '#38bdf8' }}>Beautiful Card</h2>
      <p style={{ lineHeight: '1.5' }}>
        Inline styles in React are powerful because you can compute them dynamically using JavaScript variables!
      </p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<StyledCard />);
`,
    },
    {
      type: 'checkpoint',
      id: 'cp-styles',
    },
    {
      type: 'narration',
      id: 'step2-classes',
      text: 'While inline styles are great, you often want to use external CSS. In regular HTML, you use the `class` attribute. However, `class` is a reserved keyword in JavaScript! Therefore, in React JSX, you must use `className` instead.\n\nIn this sandbox environment, we can inject raw CSS directly into the document using a `<style>` tag for demonstration.',
      code: `function ClassCard() {
  return (
    <>
      <style>{\`
        .my-card {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: white;
          padding: 2rem;
          border-radius: 16px;
          text-align: center;
          font-family: sans-serif;
          max-width: 300px;
          margin: 40px auto;
          transition: transform 0.2s ease;
          cursor: pointer;
        }
        .my-card:hover {
          transform: scale(1.05) translateY(-5px);
        }
        .my-title {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }
      \`}</style>
      
      {/* Note the use of className instead of class! */}
      <div className="my-card">
        <div className="my-title">Hover Me!</div>
        <p>Using CSS classes gives you access to hover states, animations, and media queries.</p>
      </div>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ClassCard />);
`,
    },
    {
      type: 'checkpoint',
      id: 'cp-classes',
    },
    {
      type: 'narration',
      id: 'outro',
      text: 'You now know how to structure and style React components using JSX, inline objects, and CSS classes!',
      code: null,
    }
  ]
}
