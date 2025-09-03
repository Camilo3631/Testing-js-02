Automatizar
---------------------------------------
con GitHub Actions

Una de las cosas importantes a la hora de hacer testing es preocuparnos con la automatización de por si cobra muchismo sentido emepezar a hacer Automatización de todas estas capas de testing, de UNIT TEST, Integration, End To End, UI Test, etc.

Normalmente eso lo que hacelera y aguiliza a los equipos simplemente si tienemos equipos en los cuales tenemos un equipo de ingenieria grande o pequeño no importa pero todos estan  en contrubuyendo todas estas pruebas que estamos corriendo norlamente en nuestro local, podemos
emepezar a Automatizarlas desde el lado de nuestro repositorios.

No importa en cual o en donde este hospedado tu repositorio. Por ejmplo:

 · BITBOKER

 · GitLab

 · Github

Cada uno de ellos tiene un sistema para automatizar este tipo de cosas vamos a emepezar a usar GitHub Actions con Github que es el servicio vamos a poder automatizar todo este tipo de porocesos.

Recuerda Normalmente ahi ciclos:

Ciclo pequeño: 

DEVELOP -> TEST -> DEPLOY 


Se pueden emepzar a hacer más complejos:

DEVELOP -> TEST -> DEPLOY TO STATING -> UI ->  SECURITY CHECK -> DEPLOY TO PRODUCTION 

Puede aver muchos más checks y la gracia es que esto corra de forma Automatizada.
Con eso tenemos un flujo de lo que se concoe como: Dev Ops


Dev Ops: Code -> Construir -> TesT -> Lanzar -> Monitoriar.

Veamos como lo emepzamos a implementar estos flujos de la mano de GitHubActions:

Example para mono repo:


name: API CI # ciclo de integración continuo de nuestra api

#on: [push] si no es un mono repo usalo si es mono repo on
on: 
  push:
    paths:
      - "./api/**"
      - ".github/workflows/api-ci.yml"

# corra en un direcotrio base
defaults:
  run:
    working-directory: ./api


# jobs es la forma en githuhb puede automatizar corre en una maquina macos-lastes la rama especifia y configurando node. 
jobs:   
  unit-test:
    runs-on:  macos-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Nodejs
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: ./api/package-lock.json  # isntala depencias

      - name: Clear npm cache
        shell: bash
        run: npm cache clean --force

         # isntala depencias en un entorno de depencias.
      - name: install
        shell: bash
        run: npm ci
        # corre las pruebas
      - name: run unit test
        shell: bash
        run: npm run test


Example para proyecto secillo: 




name: Form CI

on: [push]

jobs:
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test


Nota: usar defaults si poryecto monorepo si no lo es no lo uses pero si on:[pushs]

Recuerda qué cada uno de los repositorios tiene su propio sistema por ejemplo GitLab tiene los paildds, BITBOKER tiene para correr este tipos 
