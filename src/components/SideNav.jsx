import { useState } from "react"
import { first151Pokemon, getFullPokedexNumber } from "../utils"

export default function SideNav(props) {

    const { showSideMenu, handleCloseMenu, selectedPokemon, setSelectedPokemon } = props
    const [searchValue, setSearchValue] = useState('')

    const filteredPokemon = first151Pokemon.filter((element, elementIndex) => {
        if ((getFullPokedexNumber(elementIndex)).includes(searchValue)) {
            return true
        }
        if (element.toLowerCase().includes(searchValue.toLowerCase())) {
            return true
        }
        return false
    })

    return (
        <nav className={' ' + (!showSideMenu ? 'open' : '')}>
            <div className={"header " + (!showSideMenu ? 'open' : '')}>
                <button onClick={handleCloseMenu} className='open-nav-button'>
                    <i className="fa-solid fa-left-long"></i>
                </button>
                <h1 className="text-gradiant">Pokedex</h1>
            </div>
            <input
                placeholder="E.G. 001 or Pika..."
                value={searchValue}
                onChange={(event) => {
                    setSearchValue(event.target.value)
                }} />
            {
                filteredPokemon.map((pokemon, pokemonIndex) => {

                    const truePokedexNumber = first151Pokemon.indexOf(pokemon)

                    return (
                        <button
                            key={pokemonIndex}
                            onClick={() => {
                                setSelectedPokemon(truePokedexNumber)
                                handleCloseMenu()
                            }}
                            className={'nav-card ' + (truePokedexNumber === selectedPokemon ? 'nav-card-selected' : '')}>
                            <p>{getFullPokedexNumber(truePokedexNumber)}</p>
                            <p>{pokemon}</p>
                        </button>
                    )
                })
            }
        </nav>
    )
}