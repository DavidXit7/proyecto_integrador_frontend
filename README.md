# Integrantes del proyecto: David Rueda - Alejandro Peña - Karen Michelle

Para consumir los endpoints se debe usar json-server creando una carpeta para el backend

Para el archivo db.json copiar y pegar esta estructura:

{
  "ciudades": [
    {
      "id": "1",
      "ciudad": "Bucaramanga"
    },
    {
      "id": "2",
      "ciudad": "Pereira"
    },
    {
      "id": "3",
      "ciudad": "Cali"
    }
  ],
  "generos": [
    {
      "id": "1",
      "genero": "M"
    },
    {
      "id": "2",
      "genero": "F"
    },
    {
      "id": "3",
      "genero": "Otro"
    }
  ],
  "usuarios": [
    {
      "id": "1",
      "documento": "12345678",
      "nombre": "Juanito alimaña",
      "genero_id": 1,
      "ciudad_id": 3,
      "correo": "[navaja@gmail.com](mailto:navaja@gmail.com)"
    },
    {
      "id": "2",
      "documento": "9999999999",
      "nombre": "jose palomas",
      "genero_id": 1,
      "ciudad_id": 3,
      "correo": "[perdio@gmail.com](mailto:perdio@gmail.com)"
    }
  ],
  "tareas": [
    {
      "id": "1",
      "usuarios_asignados": [
        "12345678"
      ],
      "titulo": "lavar platos",
      "descripcion": "provando hola hola",
      "estado": "en proceso"
    },
    {
      "id": "2",
      "usuarios_asignados": [
        "12345678",
        "9999999999"
      ],
      "titulo": "hola mundo nuevo akfkasfasf",
      "descripcion": "test hola mubdi",
      "estado": "completada"
    },
    {
      "id": "3",
      "usuarios_asignados": [
        "12345678"
      ],
      "titulo": "a",
      "descripcion": "provando",
      "estado": "en proceso"
    },
    {
      "id": "4",
      "usuarios_asignados": [
        "9999999999"
      ],
      "titulo": "b",
      "descripcion": "provando hola hola",
      "estado": "completada"
    }
  ],
  "$schema": "./node_modules/json-server/schema.json"
}