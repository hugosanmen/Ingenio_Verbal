// Contenido local (offline) de Ingenio verbal.
// Cada nivel tiene: lecciones (teoría breve) y quiz (práctica sin IA).
// Los niveles 4 y 5 son para mayores de 18 y se bloquean en "modo blanco".

export const NIVELES = [
  {
    id: 1,
    nombre: 'Aprendiz',
    carta: 'El Aprendiz',
    fondo: '#E3F2D9',
    emoji: '🌱',
    tema: 'Palabras con dos caras',
    descripcion: 'Polisemia, homonimia y homofonía: una misma palabra (o sonido) con varios significados.',
    xpMin: 0,
    adulto: false,
    guiaIA: 'Solo polisemia y homófonos de uso cotidiano. Cero picardía. Frases cortas y claras.',
    lecciones: [
      {
        titulo: 'Polisemia: una palabra, varios significados',
        texto: 'Una palabra polisémica tiene varios significados relacionados entre sí. El contexto decide cuál se activa. El doble sentido nace cuando el contexto deja abiertas las dos lecturas.',
        ejemplos: ['"Banco": para sentarse / donde guardas dinero.', '"Gato": el animal / la herramienta para levantar el coche.', '"Sierra": la herramienta / la cordillera.'],
      },
      {
        titulo: 'Homófonos: suenan igual, se escriben distinto',
        texto: 'En el habla no se ve la ortografía, así que palabras como "tubo/tuvo" o "haya/halla" se confunden a propósito. Es la materia prima de muchos chistes.',
        ejemplos: ['"El plomero tubo/tuvo un problema."', '"No creo que haya / halla la llave."', '"Vaya / valla / baya."'],
      },
      {
        titulo: 'La regla de oro: lectura literal vs. lectura oculta',
        texto: 'Todo doble sentido tiene dos capas: la literal (lo que parece que dices) y la oculta (lo que de verdad insinúas). Entrenar el oído es aprender a escuchar las dos al mismo tiempo.',
        ejemplos: ['"Me dejaron plantado" → literal: me sembraron / oculta: no llegaron a la cita.'],
      },
    ],
    quiz: [
      { frase: 'Se ponchó la llanta, pásame el gato.', pregunta: '¿Qué significa "gato" aquí?', opciones: ['El animal', 'La herramienta para levantar el coche', 'Un amigo'], correcta: 1, explica: '"Gato" también es la herramienta para levantar el auto; el contexto (llanta ponchada) activa ese significado.' },
      { frase: 'Pasé toda la noche en vela.', pregunta: '¿Qué quiere decir "en vela"?', opciones: ['Sin dormir', 'Alumbrado con una vela', 'Navegando'], correcta: 0, explica: '"Estar en vela" es pasar la noche despierto; la vela de cera es otro significado.' },
      { frase: 'Esa chamarra está muy cara.', pregunta: '"Cara" en esta frase es…', opciones: ['El rostro', 'De precio alto', 'Querida'], correcta: 1, explica: '"Caro/cara" = de precio alto. También existe "cara" (rostro) y "cara" (querida, en otros países).' },
      { frase: 'El plomero tuvo un problema con el tubo.', pregunta: '¿Qué tipo de juego hay entre "tuvo" y "tubo"?', opciones: ['Sinónimos', 'Homófonos', 'Antónimos'], correcta: 1, explica: 'Suenan igual y se escriben distinto: son homófonos.' },
      { frase: 'Vimos una llama en el zoológico y otra en la chimenea.', pregunta: '¿Cuántos significados de "llama" aparecen?', opciones: ['Uno', 'Dos', 'Tres'], correcta: 1, explica: 'El animal y el fuego. (El tercero sería el verbo "llamar": "llama a tu mamá").' },
      { frase: 'Fuimos de campamento a la sierra.', pregunta: '"Sierra" aquí es…', opciones: ['Una herramienta', 'Una cordillera', 'Un pez'], correcta: 1, explica: 'Por el contexto (campamento) es la cordillera.' },
    ],
  },
  {
    id: 2,
    nombre: 'Ingenioso',
    carta: 'El Ingenioso',
    fondo: '#FFF4D1',
    emoji: '💡',
    tema: 'Chistes, colmos y calambures',
    descripcion: 'El doble sentido como motor del humor blanco: colmos, "¿qué le dijo…?" y calambures (juntar o separar sílabas).',
    xpMin: 100,
    adulto: false,
    guiaIA: 'Humor blanco: colmos, "qué le dijo X a Y", calambures y nombres chistosos inocentes. Sin picardía sexual.',
    lecciones: [
      {
        titulo: 'Los colmos',
        texto: 'Un colmo junta un oficio con una palabra polisémica de ese oficio. La gracia está en que la respuesta tiene sentido literal y figurado.',
        ejemplos: ['¿El colmo de un jardinero? Que lo dejen plantado.', '¿El colmo de un electricista? Que sus hijos no le sigan la corriente.'],
      },
      {
        titulo: 'Calambur: mover la frontera de las palabras',
        texto: 'El calambur reagrupa sílabas para formar otra frase. Es la base de los nombres chistosos y de muchos albures.',
        ejemplos: ['"Techo de menos" → "te echo de menos".', '"Entre el clavel y la rosa, su majestad escoja" → "es coja" (atribuido a Quevedo).', '"Armando Esteban Quito" → "armando este banquito".'],
      },
      {
        titulo: '"¿Qué le dijo…?"',
        texto: 'Se personifica un objeto y se le da una frase que funciona en dos planos: el del objeto y el humano.',
        ejemplos: ['¿Qué le dijo una impresora a otra? "¿Esa hoja es tuya o es impresión mía?"'],
      },
    ],
    quiz: [
      { frase: '¿Qué le dijo un techo a otro? "Techo de menos."', pregunta: '¿Qué frase se esconde?', opciones: ['Te echo de menos', 'Techo de metal', 'Te hecho de menos'], correcta: 0, explica: 'Calambur: "techo de" suena como "te echo de".' },
      { frase: 'El colmo de un jardinero: que lo dejen plantado.', pregunta: '¿Cuál es el sentido figurado de "plantado"?', opciones: ['Sembrado', 'Que no llegaron a su cita', 'Muy firme'], correcta: 1, explica: '"Dejar plantado" = no llegar a una cita; "plantar" es el significado de su oficio.' },
      { frase: 'Entre el clavel y la rosa, su majestad escoja.', pregunta: '¿Qué se esconde en "escoja"?', opciones: ['Que elija', '"Es coja"', '"Es hoja"'], correcta: 1, explica: 'El calambur separa "es-coja": la frase elogia y se burla al mismo tiempo.' },
      { frase: 'Me presentaron a Armando Esteban Quito.', pregunta: '¿Qué se escucha si lo dices rápido?', opciones: ['Armando este banquito', 'Ármame este banquete', 'Armando es tan quieto'], correcta: 0, explica: 'Nombre-calambur clásico: "Armando Esteban Quito" = "armando este banquito".' },
      { frase: 'El colmo de un electricista: que sus hijos no le sigan la corriente.', pregunta: '"Seguir la corriente" significa…', opciones: ['Conducir electricidad', 'Darle la razón a alguien para no discutir', 'Nadar en un río'], correcta: 1, explica: 'Sentido figurado: darle por su lado a alguien. Literal: la corriente eléctrica.' },
      { frase: '¿Esa hoja es tuya o es impresión mía?', pregunta: '¿Por qué funciona el chiste?', opciones: ['Por la rima', '"Impresión" = sensación y = impreso', 'Por la exageración'], correcta: 1, explica: '"Impresión" funciona como "me parece" y como "lo que imprime una impresora".' },
    ],
  },
  {
    id: 3,
    nombre: 'Pícaro',
    carta: 'El Pícaro',
    fondo: '#FFE0EE',
    emoji: '😏',
    tema: 'Doble sentido cotidiano y mexicanismos',
    descripcion: 'Expresiones mexicanas, refranes y frases con picardía ligera que se dicen en cualquier reunión.',
    xpMin: 250,
    adulto: false,
    guiaIA: 'Mexicanismos, refranes y picardía ligera de reunión familiar (coqueteo insinuado, nada sexual explícito).',
    lecciones: [
      {
        titulo: 'Mexicanismos de doble filo',
        texto: 'Muchas expresiones mexicanas tienen un significado literal absurdo y uno figurado que todos entienden. Dominarlas es el puente hacia la picardía.',
        ejemplos: ['"Ese cuate es bien codo" → tacaño (no la parte del brazo).', '"¡Qué oso!" → qué vergüenza.', '"Está de pelos" → está excelente.', '"Ponte las pilas" → échale ganas.'],
      },
      {
        titulo: 'Refranes y frases hechas',
        texto: 'Los refranes condensan una idea en una imagen. Usarlos fuera de contexto, o tomarlos literal, produce doble sentido.',
        ejemplos: ['"Quedarse como el perro de las dos tortas" → sin nada por indeciso.', '"Echarle los perros a alguien" → coquetearle.'],
      },
      {
        titulo: 'Picardía ligera',
        texto: 'La picardía insinúa sin decir. La frase tiene que poder defenderse en su lectura inocente: "¿Yo qué dije? Yo hablaba de tamales".',
        ejemplos: ['"Le hicieron de chivo los tamales" → le fueron infiel (literal: le dieron tamales de chivo en vez de otra carne).'],
      },
    ],
    quiz: [
      { frase: 'No le pidas prestado, es bien codo.', pregunta: '"Codo" significa…', opciones: ['Tacaño', 'Flaco', 'Trabajador'], correcta: 0, explica: 'En México "codo" = tacaño (por el gesto de golpearse el codo).' },
      { frase: 'Por no decidirse, se quedó como el perro de las dos tortas.', pregunta: '¿Qué le pasó?', opciones: ['Comió doble', 'Se quedó sin ninguna', 'Engordó'], correcta: 1, explica: 'El refrán habla de quien, por indeciso, pierde ambas opciones.' },
      { frase: 'Desde la fiesta le anda echando los perros a Laura.', pregunta: '"Echar los perros" quiere decir…', opciones: ['Soltarle a sus mascotas', 'Coquetearle', 'Regañarla'], correcta: 1, explica: 'Mexicanismo de picardía ligera: cortejar o coquetear.' },
      { frase: 'A Pepe le hicieron de chivo los tamales.', pregunta: '¿Cuál es la lectura oculta?', opciones: ['Le vendieron tamales caros', 'Le fueron infiel', 'Se enfermó del estómago'], correcta: 1, explica: 'La lectura literal (tamales de carne de chivo) encubre la insinuación de infidelidad.' },
      { frase: '¡Qué oso, me caí frente a todos!', pregunta: '"Qué oso" significa…', opciones: ['Qué miedo', 'Qué vergüenza', 'Qué fuerza'], correcta: 1, explica: '"Hacer el oso" = hacer el ridículo.' },
      { frase: 'La fiesta estuvo de pelos.', pregunta: '¿Cómo estuvo la fiesta?', opciones: ['Excelente', 'Aburrida', 'Peligrosa'], correcta: 0, explica: '"De pelos" = muy bien, excelente.' },
    ],
  },
  {
    id: 4,
    nombre: 'Alburero',
    carta: 'El Alburero',
    fondo: '#FFE1D6',
    emoji: '🌶️',
    tema: 'El albur: reglas del juego',
    descripcion: 'El albur mexicano: insinuar sin decir, no "caer" y aprender a "regresarla". Solo para mayores de 18.',
    xpMin: 450,
    adulto: true,
    guiaIA: 'Albur mexicano clásico con insinuación de doble sentido para adultos. Ingenioso, nunca explícito ni gráfico, sin groserías directas.',
    lecciones: [
      {
        titulo: '¿Qué es el albur?',
        texto: 'El albur es un juego verbal mexicano de doble sentido, casi siempre con insinuación pícara. Es un duelo: gana quien deja al otro sin respuesta. Lo valioso no es lo vulgar, sino la rapidez y lo sutil.',
        ejemplos: ['La frase debe sonar inocente para quien no "agarra la onda".'],
      },
      {
        titulo: 'Caer y regresarla',
        texto: '"Caer" es responder de forma literal a una frase con doble intención y quedar expuesto. "Regresarla" es contestar con otra frase que devuelve la insinuación. Regla de supervivencia: si dudas, no contestes literal; mejor desvía o regresa.',
        ejemplos: ['Respuestas peligrosas: "sí", "¿cuál?", "¿dónde?", repetir la palabra clave.'],
      },
      {
        titulo: 'Materia prima del albur',
        texto: 'Se usan palabras-comodín (de comida, herramientas, verbos de movimiento), calambures con nombres y pronombres ambiguos ("se la", "te lo"). Por eso se dice que es hablar de picardía sin decir nada explícito.',
        ejemplos: ['Nombres-calambur con insinuación, como "Débora Melo" (devóramelo).', 'Verbos ambiguos: "agarrar", "meter", "sacar", "dar".'],
      },
    ],
    quiz: [
      { frase: 'En un duelo de albures alguien dice que "cayó".', pregunta: '¿Qué significa "caer"?', opciones: ['Ganar el duelo', 'Responder literal y quedar expuesto al doble sentido', 'Reírse primero'], correcta: 1, explica: 'Caer = morder el anzuelo con una respuesta literal.' },
      { frase: 'Te lanzan una frase con doble intención.', pregunta: '¿Cuál es la mejor jugada?', opciones: ['Contestar "¿cuál?"', 'Regresarla con otra frase de doble sentido', 'Explicarle que entendiste'], correcta: 1, explica: 'En el albur se gana regresándola; explicar o preguntar es caer.' },
      { frase: 'Me presentaron a Débora Melo.', pregunta: '¿Qué técnica usa este nombre?', opciones: ['Rima', 'Calambur con insinuación', 'Anagrama'], correcta: 1, explica: 'Al unir sílabas se escucha otra frase: es un calambur con picardía.' },
      { frase: 'El buen alburero…', pregunta: '¿Qué lo distingue?', opciones: ['Dice groserías directas', 'Insinúa con sutileza y rapidez', 'Habla más fuerte'], correcta: 1, explica: 'La grosería directa no es albur; la gracia está en la sutileza.' },
      { frase: '¿Por qué el albur casi siempre suena inocente?', pregunta: 'Elige la mejor respuesta', opciones: ['Porque debe poder defenderse en su lectura literal', 'Porque es para niños', 'Porque es poesía'], correcta: 0, explica: 'La lectura inocente es la coartada: "yo hablaba de tamales".' },
    ],
  },
  {
    id: 5,
    nombre: 'Maestro',
    carta: 'El Maestro',
    fondo: '#E1E8F7',
    emoji: '🎩',
    tema: 'Duelo de ingenio',
    descripcion: 'Duelos rápidos contra la IA: encadenar, regresarla y cerrar sin dejar respuesta. Solo para mayores de 18.',
    xpMin: 700,
    adulto: true,
    guiaIA: 'Duelo de albures de alto nivel: respuestas rápidas, encadenadas, muy sutiles; premia la elegancia sobre la vulgaridad. Nunca explícito.',
    lecciones: [
      {
        titulo: 'Encadenar',
        texto: 'Un maestro no solo responde: toma la palabra del rival y la usa para construir su propia frase. Así mantiene la iniciativa.',
        ejemplos: ['Escucha la palabra clave del rival y reciclala en tu respuesta.'],
      },
      {
        titulo: 'Cerrar el duelo',
        texto: 'El cierre perfecto deja al rival sin salida literal ni figurada. Suele ser corto, con remate inesperado y una lectura inocente impecable.',
        ejemplos: ['Menos palabras = más golpe.'],
      },
      {
        titulo: 'Ética del alburero',
        texto: 'El albur es un juego entre quienes quieren jugar. No se usa para humillar a quien no participa, ni con menores, ni en contextos de trabajo donde incomoda.',
        ejemplos: ['Lee el ambiente antes de lanzar la primera.'],
      },
    ],
    quiz: [
      { frase: 'Tu rival usa la palabra "tamal" en su frase.', pregunta: '¿Qué haría un maestro?', opciones: ['Cambiar de tema', 'Encadenar: usar "tamal" en su respuesta', 'Pedir que repita'], correcta: 1, explica: 'Encadenar mantiene la iniciativa y demuestra rapidez.' },
      { frase: 'El mejor cierre de duelo…', pregunta: 'Elige la descripción correcta', opciones: ['Largo y explicado', 'Corto, inesperado y defendible en lo literal', 'Lleno de groserías'], correcta: 1, explica: 'Brevedad + sorpresa + coartada literal.' },
      { frase: '¿Con quién NO se alburea?', pregunta: 'Elige la opción correcta', opciones: ['Con amigos que juegan', 'Con menores o con quien no quiere jugar', 'Con otro alburero'], correcta: 1, explica: 'El albur es un juego consensuado entre adultos.' },
    ],
  },
];

// Preguntas de colocación (mezcla de niveles 1–3, aptas para todo público).
export const COLOCACION = [
  { nivel: 1, ...NIVELES[0].quiz[0] },
  { nivel: 1, ...NIVELES[0].quiz[3] },
  { nivel: 2, ...NIVELES[1].quiz[0] },
  { nivel: 2, ...NIVELES[1].quiz[2] },
  { nivel: 3, ...NIVELES[2].quiz[3] },
  { nivel: 3, ...NIVELES[2].quiz[1] },
];

export function nivelPorId(id) {
  return NIVELES.find((n) => n.id === id) || NIVELES[0];
}
