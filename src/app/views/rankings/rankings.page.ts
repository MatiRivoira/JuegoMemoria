import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-rankings',
  templateUrl: './rankings.page.html',
  styleUrls: ['./rankings.page.scss'],
})
export class RankingsPage {
  topScores!: any;
  dificultadSeleccionada: string = '';
  isLoading:boolean = false;

  constructor(private firestoreService: FirestoreService) { }

  async seleccionarDificultad(dificultad: string) {
    this.dificultadSeleccionada = dificultad;
    this.isLoading = true; // Activa el spinner
    let aux = dificultad;
    switch(dificultad){
      case "difícil":
        aux = "dificil";
        break;
      case "fácil":
        aux = "facil";
        break;
    }
    this.firestoreService.getTopScores(`ranking-${aux}`).subscribe(
      scores => {
        this.topScores = scores;
        this.isLoading = false; // Desactiva el spinner
      },
      error => {
        console.error('Error fetching scores:', error);
        this.isLoading = false; // Asegúrate de desactivar el spinner también en caso de error
      }
    );
  }
}
