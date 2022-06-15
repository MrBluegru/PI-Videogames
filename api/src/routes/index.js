require('dotenv').config();
const { Router } = require('express');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const axios = require('axios');
const {Videogame, Gender} = require('../db');
const API_KEY = process.env.DB_API_KEY;
const router = Router();
// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

const getApiInfo = async () => {
    const apiUrl = await axios.get(`https://api.rawg.io/api/games?key=${API_KEY}`);
    const apiInfo = await apiUrl.data.results.map(e => {
        return {
            name: e.name,
            img: e.background_image,
            id: e.id,
            description: e.description,
            released: e.released,
            rating: e.rating,
            platforms: e.platforms.map(e => e),
        };
    });
    return apiInfo;
};

const getDbInfo = async () => {
    return await Videogame.findAll({
        include:{
            model: Gender,
            attributes: ['id', 'name'],
            through: {
                attributes: [],
            },
        }
    });
};

const getAllVideogames = async () => {
    const apiInfo = await getApiInfo();
    const dbInfo = await getDbInfo();
    const infoTotal = apiInfo.concat(dbInfo);
    return infoTotal;
}

router.get('/videogames', async (req, res) => {
    const name = req.query.name;
    let videogamesTotal = await getAllVideogames();
    if (name) {
        let videogamesName = await videogamesTotal.filter(e => e.name.toLowerCase().includes(name.toLowerCase()));
        videogamesName.length?
        res.status(200).send(videogamesName):
        res.status(404).send('No se encontro ningun videojuego con ese nombre');
    } 
    else {
        res.status(200).send(videogamesTotal);
    }

});
module.exports = router;


// [ ] GET /videogames debe Obtener un listado de los videojuegos y Debe devolver solo los datos necesarios para la ruta principal

// [ ] GET /videogames?name="...": Obtener un listado de las primeros 15 videojuegos que contengan la palabra ingresada como query parameter Si no existe ningún videojuego mostrar un mensaje adecuado

// [ ] GET /videogame/{idVideogame}:
// Obtener el detalle de un videojuego en particular
// Debe traer solo los datos pedidos en la ruta de detalle de videojuego
// Incluir los géneros asociados
// [ ] GET /genres:
// Obtener todos los tipos de géneros de videojuegos posibles
// En una primera instancia deberán traerlos desde rawg y guardarlos en su propia base de datos y luego ya utilizarlos desde allí
// [ ] POST /videogame:
// Recibe los datos recolectados desde el formulario controlado de la ruta de creación de videojuego por body
// Crea un videojuego en la base de datos
