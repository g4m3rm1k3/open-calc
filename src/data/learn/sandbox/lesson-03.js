export const lesson = {
  id: 'sandbox-3',
  series: { id: 'sandbox', title: 'Web Sandbox' },
  title: '3. State & Interactivity',
  language: 'react',
  checkpoints: [
    { id: 'cp-events', label: 'Event Listeners' },
    { id: 'cp-state', label: 'useState Hook' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      text: 'A static component is nice, but web applications need to respond to user input. In React, we handle interactions using Event Listeners and State.',
      code: `function Button() {
  function handleClick() {
    alert('Button was clicked!');
  }

  // Notice how onClick is camelCase, and we pass the function reference
  // WITHOUT calling it (no parentheses!)
  return (
    <button 
      onClick={handleClick}
      style={{
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#0ea5e9',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer'
      }}
    >
      Click Me!
    </button>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
    <Button />
  </div>
);
`,
    },
    {
      type: 'checkpoint',
      id: 'cp-events',
    },
    {
      type: 'narration',
      id: 'step1-state',
      text: 'When a variable changes in standard JavaScript, the screen doesn\'t magically update. In React, we use the `useState` hook to declare variables that *do* update the screen automatically when they change.',
      code: `// We extract useState from the React object
const { useState } = React;

function Counter() {
  // useState returns an array with exactly two items:
  // 1. The current value of the state variable
  // 2. A function to update that value
  const [count, setCount] = useState(0);

  return (
    <div style={{
      textAlign: 'center',
      padding: '40px',
      fontFamily: 'sans-serif',
      backgroundColor: '#1e293b',
      color: 'white',
      borderRadius: '16px',
      maxWidth: '300px',
      margin: '40px auto'
    }}>
      <h2>Count: {count}</h2>
      
      <button 
        onClick={() => setCount(count + 1)}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Increment
      </button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Counter />);
`,
    },
    {
      type: 'checkpoint',
      id: 'cp-state',
    },
    {
      type: 'challenge',
      id: 'challenge-1',
      text: 'Challenge. Modify the Counter component above to add a "Decrement" button that decreases the count by 1. Place it next to the Increment button.',
      startCode: `const { useState } = React;

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div style={{
      textAlign: 'center',
      padding: '40px',
      fontFamily: 'sans-serif',
      backgroundColor: '#1e293b',
      color: 'white',
      borderRadius: '16px',
      maxWidth: '300px',
      margin: '40px auto'
    }}>
      <h2>Count: {count}</h2>
      
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          onClick={() => setCount(count + 1)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Increment
        </button>
        
        {/* ADD DECREMENT BUTTON HERE */}
        
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Counter />);
`,
    },
  ]
}
