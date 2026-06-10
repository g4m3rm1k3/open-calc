import './App.css';
import Card from './Card';
import type {CardData} from './Card';



function App(){
  const cards: CardData[] = [
    {id: "1", title: "Fix the login bug", label: "Bug"},
    {id: "2", title: "Add dark mode", label: "Feature"},
    {id: "3", title: "Write API docs", label: "Docs"},
    {id: "4", title: "Deploy to staging", label: "DevOps", description: "Testing"}
  ]
  return(
    <div className="app-container">
      <h1 className="app-title">FlowBoard</h1>
      <p className="app-subtitle">Your work, your way.</p>
      <span className="version-badge">v0.1.0 - Alpha</span>
      <div className="list-column">
      {cards.map((card) => (
        <Card key={card.id} {...card}/>
      ) )}
      </div>
    </div>
  )
}

export default App;