import { Component, OnInit, inject } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { FirestoreService } from 'src/app/services/firestore.service';

interface Card {
  id: number;
  src: string;
  matched: boolean;
  flipped?: boolean;
}

@Component({
  selector: 'app-jugar',
  templateUrl: './jugar.page.html',
  styleUrls: ['./jugar.page.scss'],
})
export class JugarPage {
  dificultadElegida!: string;
  imagesFacil: Card[] = [
    { id: 1, src: 'assets/img/animales/rata.png', matched: false },
    { id: 2, src: 'assets/img/animales/pato.png', matched: false },
    { id: 3, src: 'assets/img/animales/puercoespin.png', matched: false }
  ];
  
  imagesMedio: Card[] = [
    { id: 1, src: 'assets/img/herramientas/martillo.png', matched: false },
    { id: 2, src: 'assets/img/herramientas/sierra.png', matched: false },
    { id: 3, src: 'assets/img/herramientas/destornillador.png', matched: false },
    { id: 4, src: 'assets/img/herramientas/llave.png', matched: false },
    { id: 5, src: 'assets/img/herramientas/taladro.png', matched: false }
  ];
  
  imagesDificil: Card[] = [
    { id: 1, src: 'assets/img/frutas/manzana.png', matched: false },
    { id: 2, src: 'assets/img/frutas/banana.png', matched: false },
    { id: 3, src: 'assets/img/frutas/naranja.png', matched: false },
    { id: 4, src: 'assets/img/frutas/piña.png', matched: false },
    { id: 5, src: 'assets/img/frutas/sandia.png', matched: false },
    { id: 6, src: 'assets/img/frutas/kiwi.png', matched: false },
    { id: 7, src: 'assets/img/frutas/mango.png', matched: false },
    { id: 8, src: 'assets/img/frutas/fresa.png', matched: false }
  ];
  images!: Card[];
  cards: Card[] = [];
  checkMatch: Card[] = [];
  gameTimeInSeconds: number = 0;  // Añadir esta línea para declarar la propiedad time
  timerSubscription!: Subscription;
  gameWon: boolean = false;

  bdService = inject(FirestoreService);

  constructor() { }

  setupCards() {
    this.cards = [...this.images, ...this.images]
      .map((item) => ({ ...item, id: Math.random(), flipped: false, matched: false }))
      .sort(() => Math.random() - 0.5);
  }

  toggleCard(card: Card) {
    if (!card.matched && this.checkMatch.length < 2) {
      card.flipped = !card.flipped;

      if (card.flipped) {
        this.checkMatch.push(card);
        if (this.checkMatch.length === 2) {
          this.checkCards();
        }
      } else {
        this.checkMatch = this.checkMatch.filter(c => c.id !== card.id);
      }
    }
  }

  checkCards() {
    if (this.checkMatch.length === 2) {
      const [firstCard, secondCard] = this.checkMatch;
  
      if (firstCard.src === secondCard.src) {
        firstCard.matched = true;
        secondCard.matched = true;
        this.checkMatch = []; // Limpia el array para nuevas selecciones
        this.checkIfGameIsOver(); // Verifica si el juego ha terminado
      } else {
        setTimeout(() => {
          firstCard.flipped = false;
          secondCard.flipped = false;
          this.checkMatch = []; // Limpia el array después de manejar las tarjetas no coincidentes
        }, 500);
      }
    }
  }
  
  // Si es necesario, implementa forceUpdate para forzar la detección de cambios en Angular
  forceUpdate() {
    this.cards = [...this.cards];
  }

  startTimer() {
    const source = timer(1000, 1000);
    this.timerSubscription = source.subscribe(val => this.gameTimeInSeconds = val);
  }

  seleccionarDificultad(dificultad: string) {
    this.gameWon = false;
    this.dificultadElegida = dificultad;
    switch (dificultad) {
      case 'facil':
        this.images = this.imagesFacil;
        break;
      case 'medio':
        this.images = this.imagesMedio;
        break;
      case 'dificil':
        this.images = this.imagesDificil;
        break;
    }
    this.setupCards();
    this.startTimer();
  }
  

  stopTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
  

  // Agrega este método en tu clase JugarPage
  checkIfGameIsOver() {
    // Comprueba si todas las tarjetas han sido emparejadas
    const allMatched = this.cards.every(card => card.matched);
    if (allMatched) {
      this.stopTimer(); // Detener el temporizador
      setTimeout(() => {
        this.saveGameResult();
        this.gameWon = true;
      }, 300);
    }
  }

  salir(){
    this.dificultadElegida = "";
    this.gameWon = false;
    this.images = [];
    this.cards = [];
    this.checkMatch = [];
    this.gameTimeInSeconds = 0;  // Añadir esta línea para declarar la propiedad time
    this.timerSubscription.unsubscribe();
    this.gameWon = false;
  }

  saveGameResult() {
    const userdata = (JSON.parse(localStorage.getItem('userdata') || '{ "user": "{ "email": "unknown" }"}')).user.email;
    const currentTime = new Date();  // Obtiene la fecha y hora actual
    const dataToSave = {
      email: userdata,
      seconds: this.gameTimeInSeconds,  // Segundos de juego
      timestamp: currentTime,  // Fecha y hora actual
    };
  
    // Usamos una plantilla de cadena para definir el nombre de la colección dinámicamente
    this.bdService.addCollection(dataToSave, `ranking-${this.dificultadElegida}`)
      .then(() => {
        console.log('Datos guardados con éxito');
      })
      .catch(error => {
        console.error('Error guardando los datos: ', error);
      });
  }
}

