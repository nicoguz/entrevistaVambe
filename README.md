# Entrevista Vambe
## App en producción
La aplicación está alojada en vercel con la url: [https://entrevista-vambe.vercel.app](https://entrevista-vambe.vercel.app)  
Decidí vercel por la facilidad y rapidez de levantar una máquina.

Por otro lado, la base de datos quedó alojada en prisma (dentro de mi cuenta personal). Ocupé este servicio también por la facilidad de uso con next.js, además de aprovechar la oportunidad de aprender una herramienta nueva.

No es necesario cargar el csv del enunciado, los datos ya fueron procesados y guardados. Sin embargo, se puede cargar otro set de datos de la misma estructura para ampliar la base de datos.

A grandes rasgos, la app tiene 2 funcionalidades:
1. Procesar csv de ventas:  
  La página `/upload` recibe un csv con el formato del enunciado y lo procesa. Separé la generación de insights extra (hecho por el LLM) en un proceso aparte que se debe hacer a mano para mejorar la transparencia del funcionamiento de la app. Todo debería estar bien señalado dentro de la misma app.
2. Mostrar información procesada:  
  En la página de `/dashboard` se muestran distintas gráficas y estadísticas que ayudan a entender mejor el set de datos, utilizando datos duros como el largo de cada reunión, o ventas cerradas por vendedor, como también datos inferidos por el LLM como la industria de cada cliente, canal de origen de cada reunión (por donde conocieron vambe), familiaridad previa con el producto, entre otros. Cada dimensión está pensada como un punto que podría ser relevante a la hora de realizar una venta y que podría marcar alguna tendencia interesante. Por ejemplo, los clientes que están bien familiarizados con el producto de antemano son más propensos a contratar vambe? Las reuniones más largas indicán mayor chance de cerrar una venta? Qué industria es la que más contrata a vambe? Cuales son los objetivos principales de los clientes al contatar vambe?

## Notas
* El modelo de datos puede revisarse en `./prisma/schema.prisma`  
* Podrán notar que el modelo ClientInsights tiene más campos de los que se muestran en la app, como keywords o painPoints. Esto resultó de mi experimentación con el set de datos. Creo que en este punto no hay info valiosa para mostrar dentro de esas dimensiones, pero definitivamente pueden ser características importantes para un dataset más grande o con transcripciones más largas.  
* Algo similar ocurre con los campos engagement y sentiment. Como las transcripciones son cortas y más o menos homogeneas, el modelo de IA detecto sentimiento positivo para todas las reuniones y un engament de 4 para casi todas las entrevistas. Con este dataset esta info no es tan valiosa, pero para transcripciones más largas y posiblemente más complejas definitivamente añadiría un punto interesante a analizar contra las ventas cerradas.
* Por último, la variable Volumen de interacciones se refiere a la cantidad de solicitudes que los clientes indican tener en promedio. Se categorizan en low, medium o high, dejando la categorización al LLM según lo que mencionan en las reuniones. Frases como "Tenemos 500 solicitudes en un día peak" son las que determinan esta variable. Por otro lado, familiaridad se refiere a que tanto conocían/entendían vambe antes de la reunión (inferido por LLM).

## Configuración
Para ejecutar en local primero se debe correr
```bash
npm install
```

Además se debe configurar un archivo `.env` con las siguientes variables:
* `DATABASE_URL`: Url que apunte a una BD en prisma.
* `GEMINI_API_KEY`: Api key para usar Gemini.

## Comandos de ejecución

Para levantar el servidor dev:

```bash
npm run dev
```

La aplicación será expuesta en [http://localhost:3000](http://localhost:3000).
