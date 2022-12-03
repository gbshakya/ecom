import React, { useState }  from "react";
import logo from './logo.svg'


function App(){

    const [newItem, setNewItem] = useState();
    const [list, setList] = useState(['a','b','c','d'])

    function addItem(todoValue){
        if(todoValue !== ""){
            setNewItem({
                id:Date.now(),
                value: todoValue,
                isDone: false
            })
        }

    }

    return(
        <div>
            <h1>Gautam Buddha Shakya</h1>
            <img src={logo} width = '100' height = '100' className = 'logo'/>
            <h1 className='"app.title'>LCO todo app</h1>

            <div className="container">
                Add an item ..
                <br />
                <input type="text"
                className = "input-text"
                placeholder = "Write a todo"
                required
                value={newItem}
                onChange = {e => addItem(e.target.value)}
                />

                <button className="add-btn"
                onClick = {() => setList(list => list.concat(newItem + " "))}
                disabled = {!newItem.length}>Add todo here</button>
            </div>
            <div className="list">
                <ul>
                    {list.map(item =>{
                        return(
                            <></>
                        )
                    })}
                </ul>


            </div>

            <h1>The newItem value is {newItem}</h1>
            <h2>The list values is {list}</h2>

        </div>
    )
}


export default App