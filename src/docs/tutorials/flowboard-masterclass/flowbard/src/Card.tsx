import './Card.css';

export interface CardData{
    id: string;
    title: string;
    label: string;
    description?:string;
}

function Card(props: CardData){
    return(
        <div className="card">
            <h3 className="card-title">{props.title}</h3>
            {props.description && <p>{props.description}</p>}
            <span className="card-label">{props.label}</span>
        </div>
    )
}

export default Card;