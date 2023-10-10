// Importa el módulo 'express' para crear una aplicación web
const express = require('express');

// Crea una instancia de la aplicación Express
const app = express();
const Joi = require('joi');

// Importa el módulo 'fs' (File System) para trabajar con archivos
const fs = require('fs');

// Importa la función 'uuidv4' del módulo 'uuid' para generar identificadores únicos
const { v4: uuidv4 } = require('uuid');

// Importa los módulos creados internamente, en este caso, el módulo 'files' en la carpeta 'src'
const { readFile, writeFile } = require('./src/files.js');

// Ruta del archivo donde se almacenarán los datos de las mascotas
const FILE_NAME = './DB/Country.txt';

// Configura Express para analizar datos de formularios y JSON en las solicitudes
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Define rutas



// Define un esquema de validación utilizando Joi
const countrySchema = Joi.object({
    Nombre: Joi.string().required(),
    Capital: Joi.string().required(),
    Edad: Joi.number().integer().required(),
    EsIndependiente: Joi.boolean().required(),
    ComidasTipicas: Joi.array().items(Joi.object({
        Nombre: Joi.string()
    })),
    Poblacion: Joi.number().required(),
    Presidente: Joi.string().required(),
    Continente: Joi.string().required()
});


// Rutas de la API

// Obtener todos los paises
// Define una ruta para manejar solicitudes GET a '/Country'
app.get('/Country', (req, res) => {
    // Lee los datos del archivo especificado en FILE_NAME
    const data = readFile(FILE_NAME);
    
    // Envía una respuesta JSON al cliente con los datos leídos del archivo
    res.json(data);
});

// Crear un nuevo pais
app.post('/Country', (req, res) => {
    try {
        // Obtener el nuevo país desde la solicitud POST
        const newCountry = req.body;

        // Validar los datos con el esquema definido
        const { error } = countrySchema.validate(newCountry);

        if (!error) {
            // Generar un nuevo ID único para el país utilizando 'uuid'
            newCountry.id = uuidv4();

            // Leer los datos actuales de los países desde el archivo
            const data = readFile(FILE_NAME);

            // Agregar el nuevo país al conjunto de datos existente
            data.push(newCountry);

            // Escribir los datos actualizados en el archivo
            writeFile(FILE_NAME, data);

            // Responder con un mensaje de éxito
            res.json({ message: 'El país fue creado exitosamente' });
        } else {
            // Los datos no cumplen con los requisitos, muestra un mensaje de error
            console.error('Los datos de la solicitud POST no cumplen con los requisitos especificados.');
            res.status(400).json({ message: 'Los datos de la solicitud POST no cumplen con los requisitos especificados.' });
        }
    } catch (error) {
        // Manejar errores, como problemas de lectura/escritura en el archivo
        console.error(error);
        res.json({ message: 'Error al almacenar país' });
    }
});



// Obtener una solo Pais por su ID
app.get('/Country/:id', (req, res) => {
    console.log(req.params.id);

    // Guardar el ID proporcionado en la URL
    const id = req.params.id;

    // Leer el contenido del archivo que contiene los Paises
    const pets = readFile(FILE_NAME);

    // Buscar el Pais con el ID proporcionado
    const petFound = pets.find(pet => pet.id === id);

    // Comprobar si el Pais fue encontrada
    if (!petFound) {
        res.status(404).json({ 'ok': false, message: 'Country not found' });
    }

    // Responder con los datos del Pais encontrado
    res.json({ 'ok': true, pet: petFound });
});


// Ruta para actualizar un país por su ID
app.put('/Country/:id', (req, res) => {
    // Obtener el ID proporcionado en la URL
    const id = req.params.id;

    // Leer el contenido del archivo que contiene los países
    const countries = readFile(FILE_NAME);

    // Buscar el país con el ID proporcionado
    const countryIndex = countries.findIndex(country => country.id === id);

    // Comprobar si el país fue encontrado
    if (countryIndex < 0) {
        res.status(404).json({ 'ok': false, message: 'Country not found' });
        return;
    }

    // Obtener el país actual
    let country = countries[countryIndex];

    // Actualizar los datos del país con los datos proporcionados en la solicitud
    country = { ...country, ...req.body };

    // Reemplazar el país en la lista con el país actualizado
    countries[countryIndex] = country;

    // Escribir los datos actualizados en el archivo
    writeFile(FILE_NAME, countries);

    // Responder con los datos del país actualizado
    res.json({ 'ok': true, country: country });
});



// Ruta para borrar un país por su ID
app.delete('/Country/:id', (req, res) => {
    // Obtener el ID proporcionado en la URL
    const id = req.params.id;

    // Leer el contenido del archivo que contiene los países
    const countries = readFile(FILE_NAME);

    // Buscar el país con el ID proporcionado
    const countryIndex = countries.findIndex(country => country.id === id);
git
    // Comprobar si el país fue encontrado
    if (countryIndex < 0) {
        res.status(404).json({ 'ok': false, message: 'Country not found' });
        return;
    }

    // Eliminar el país del conjunto de datos
    countries.splice(countryIndex, 1);

    // Escribir los datos actualizados en el archivo
    writeFile(FILE_NAME, countries);

    // Responder con un mensaje de éxito
    res.json({ 'ok': true });
});


// Iniciar el servidor y escuchar en el puerto 3000
app.listen(3000, () => {
    console.log(`Server is running on http://localhost:3000`);
});
