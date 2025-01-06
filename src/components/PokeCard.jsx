import { useState } from "react"
import { useEffect } from "react"
import { getFullPokedexNumber, getPokedexNumber } from "../utils"
import TypeCard from "./TypeCard"
import Modal from "./Modal"

export default function PokeCard(props) {

    const { selectedPokemon } = props
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [skill, setSkill] = useState(null)
    const [loadingSkill, setLoadingSkill] = useState(false)

    const { name, height, abilities, stats, types, moves, sprites } = data || {}

    const imgList = Object.keys(sprites || {}).filter(val => {
        if (!sprites[val]) { return false }
        if (['versions', 'other'].includes(val)) { return false }
        return true
    })

    async function fetchMoveData(move, moveURL) {

        if (loadingSkill || !localStorage || !moveURL) {
            return
        }

        let cache = {}
        if (localStorage.getItem('pokemon-moves')) {
            cache = JSON.parse(localStorage.getItem('pokemon-moves'))
        }

        if (move in cache) {
            setSkill(cache[move])
            return
        }

        try {
            setLoadingSkill(true)

            const res = await fetch(moveURL)
            const moveData = await res.json()
            const description = moveData?.flavor_text_entries.filter(
                val => { return val.version_group.name = 'firered-leafgreen' }
            )[0]?.flavor_text
            let pp = moveData?.pp
            let power = moveData?.power
            let accuracy = moveData?.accuracy

            if (!pp) pp = "N/A"
            if (!power) power = "N/A"
            if (!accuracy) accuracy = "N/A"

            const skillData = {
                name: move,
                description,
                power, pp, accuracy
            }
            setSkill(skillData)

            cache[move] = skillData
            localStorage.setItem('pokemon-moves', JSON.stringify(cache))
        } catch (err) {
            console.log(err.message)
        } finally {
            setLoadingSkill(false)
        }
    }

    useEffect(() => {

        if (loading || !localStorage) {
            return
        }

        let cache = {}
        if (localStorage.getItem('pokedex')) {
            cache = JSON.parse(localStorage.getItem('pokedex'))
        }

        if (selectedPokemon in cache) {
            setData(cache[selectedPokemon])
            return
        }

        async function fetchPokemonData() {

            setLoading(true)
            try {
                const baseURL = 'https://pokeapi.co/api/v2/'
                const suffix = 'pokemon/' + getPokedexNumber(selectedPokemon)
                const finalURL = baseURL + suffix

                const res = await fetch(finalURL)
                const pokemonData = await res.json()
                setData(pokemonData)

                cache[selectedPokemon] = pokemonData
                localStorage.setItem('pokedex', JSON.stringify(cache))
            } catch (err) {
                console.log(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchPokemonData()

    }, [selectedPokemon])

    if (loading || !data) {
        return (
            <div>
                <h4>Loading...</h4>
            </div>
        )
    }
    return (
        <div className='poke-card'>

            {skill && (<Modal handleCloseModal={() => { setSkill(null) }}>
                <div>
                    <h6>Name</h6>
                    <h2 className='skill-name'>{skill.name.replaceAll('-', ' ')}</h2>
                </div>
                <div>
                    <h6>Description</h6>
                    <p>{skill.description}</p>
                </div>
                <div>
                    <h6>PP</h6>
                    <p>{skill.pp}</p>
                </div>
                <div>
                    <h6>Power</h6>
                    <p>{skill.power}</p>
                </div>
                <div>
                    <h6>Accuracy</h6>
                    <p>{skill.accuracy}</p>
                </div>
            </Modal>)}

            <div>
                <h4>#{getFullPokedexNumber(selectedPokemon)}</h4>
                <h2>{name}</h2>
            </div>
            <div className='type-container'>
                {types.map((typeObj, typeIndex) => {
                    return (
                        <TypeCard key={typeIndex} type={typeObj?.type?.name} />
                    )
                })}
            </div>
            <img
                className='default-img'
                src={'/pokemon/' + getFullPokedexNumber(selectedPokemon) + '.png'}
                alt={`${name}-large-img`}
            />
            <div className='img-container'>
                {
                    imgList.map((spriteURL, spriteIndex) => {
                        const imgURL = sprites[spriteURL]
                        return (
                            <img
                                key={spriteIndex}
                                src={imgURL}
                                alt={`${name}-img-${spriteURL}`}
                            />
                        )
                    })
                }
            </div>
            <h3>Stats</h3>
            <div className='stats-card'>
                {
                    stats.map((statObj, statIndex) => {
                        const { stat, base_stat } = statObj
                        return (
                            <div key={statIndex} className='stat-item'>
                                <p>{stat?.name.replaceAll('-', ' ')}</p>
                                <h4>{base_stat}</h4>
                            </div>
                        )
                    })
                }
            </div>
            <h3>Moves</h3>
            <div className='pokemon-move-grid'>
                {
                    moves.sort(function (a, b) {
                        if (a.move?.name.toLowerCase() < b.move?.name.toLowerCase()) return -1
                        if (a.move?.name.toLowerCase() > b.move?.name.toLowerCase()) return 1
                        return 0
                    }).map((moveObj, moveIndex) => {
                        return (
                            <button
                                className='button-card pokemon-move'
                                key={moveIndex}
                                onClick={() => {
                                    fetchMoveData(moveObj?.move?.name, moveObj?.move?.url)
                                }}
                            >
                                <p>{moveObj?.move?.name.replaceAll('-', ' ')}</p>
                            </button>
                        )
                    })
                }
            </div>
        </div>
    )
}