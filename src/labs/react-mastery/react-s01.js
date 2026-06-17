// React Deep Dive — Lesson 01
// Raw React: Elements and State (Without JSX)

export const lesson = {
  id: 'sandbox-1',
  series: { id: 'sandbox', title: 'Web Sandbox' },
  title: '1. Raw React: Elements & State',
  language: 'react', // Tells WebLessonPlayer to render the output as a web page
  checkpoints: [
    { id: 'cp-elements',   label: 'React.createElement' },
    { id: 'cp-components', label: 'Components' },
    { id: 'cp-state',      label: 'State & Interactivity' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'Most people learn React by immediately writing JSX — the HTML-like syntax that makes React feel like writing templates. But JSX is just syntactic sugar. Under the hood, React is purely JavaScript.\n\nIn this lesson, we are going to build an interactive React component completely from scratch using raw JavaScript. By doing this, you will understand exactly what React is doing when it renders the DOM.',
      code: null,
    },

    // ── Step 1: React.createElement ───────────────────────────────────────────

    {
      type: 'narration',
      id: 'step1-create-element',
      text: 'The fundamental building block of React is the "React Element". You create one using `React.createElement(type, props, ...children)`. A React element is not a real HTML DOM node; it is just a plain JavaScript object describing what you *want* to see on the screen. React DOM takes that object and paints it.\n\nRun the code below to see a raw React Element rendered to the screen without any JSX.',
      code: `// We use React.createElement(type, props, children)
// Type: The HTML tag string (e.g., 'h1', 'div')
// Props: An object of attributes/styles (or null)
// Children: Text or other React elements

const titleElement = React.createElement(
  'h1', 
  { style: { color: '#8b5cf6', fontFamily: 'sans-serif' } }, 
  'Hello, Raw React!'
);

// We tell ReactDOM to take our virtual element and paint it into the real DOM
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(titleElement);
`,
    },

    // ── Step 2: Components are just functions ─────────────────────────────────

    {
      type: 'narration',
      id: 'step2-components',
      text: 'A React Component is simply a JavaScript function that returns a React Element. By wrapping our element in a function, we make it reusable. We can also pass arguments to this function — React calls these "props".\n\nNotice how we are now passing children as the third, fourth, and fifth arguments to `createElement` to nest elements inside a parent `div`.',
      code: `function WelcomeCard(props) {
  // A component is just a function that returns an Element.
  return React.createElement(
    'div',
    { 
      style: { 
        padding: '20px', 
        border: '1px solid #334155', 
        borderRadius: '8px',
        backgroundColor: '#0f172a',
        color: 'white',
        fontFamily: 'sans-serif'
      } 
    },
    // The children of this div:
    React.createElement('h2', { style: { marginTop: 0 } }, props.title),
    React.createElement('p', { style: { color: '#94a3b8' } }, props.message)
  );
}

// To render a component, we tell React to create an element of the *function type*
const appElement = React.createElement(
  WelcomeCard, 
  { title: 'Components', message: 'I am a function returning objects.' }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(appElement);
`,
    },

    // ── Step 3: Adding State ──────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step3-state',
      text: 'Static elements are boring. We want interactivity. React provides a hook called `useState` that allows our function to remember data across renders.\n\nWhen state changes, React calls our component function *again*, gets the new Element objects, compares them to the old ones (the Virtual DOM diff), and surgically updates only the real HTML DOM nodes that changed.',
      code: `function Counter() {
  // React.useState returns an array: [currentValue, setterFunction]
  const [count, setCount] = React.useState(0);

  return React.createElement(
    'div',
    { 
      style: { 
        padding: '24px', 
        fontFamily: 'sans-serif',
        textAlign: 'center',
        backgroundColor: '#0f172a',
        borderRadius: '12px',
        color: '#f8fafc'
      } 
    },
    React.createElement('h2', null, 'Count: ', count),
    React.createElement(
      'button',
      {
        // We attach an event listener via props
        onClick: () => setCount(count + 1),
        style: {
          padding: '10px 20px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px'
        }
      },
      'Increment'
    )
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(Counter));
`,
    },

    // ── Challenge ─────────────────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-raw-react',
      text: 'Challenge: Modify the Counter component below. Add a second button that DECREMENTS the count. You will need to add it as another child element inside the parent `div`.',
      expectedOutput: null,
      startCode: `function Counter() {
  const [count, setCount] = React.useState(0);

  return React.createElement(
    'div',
    { style: { padding: '24px', fontFamily: 'sans-serif', color: 'white', backgroundColor: '#0f172a' } },
    
    React.createElement('h2', null, 'Count: ', count),
    
    React.createElement(
      'button',
      {
        onClick: () => setCount(count + 1),
        style: { padding: '8px 16px', marginRight: '8px', cursor: 'pointer' }
      },
      'Increment'
    )
    
    // TODO: Add a second button here that calls setCount(count - 1)
    
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(Counter));
`,
      hint: 'Add a comma after the first button element, then write another React.createElement("button", { onClick: () => setCount(count - 1) }, "Decrement").',
    }
  ]
}
