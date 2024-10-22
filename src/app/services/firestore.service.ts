import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor(private firestore: AngularFirestore) {}

  // Función para añadir datos a una colección
  addCollection(dato: any, coleccion: string) {
    return this.firestore.collection(coleccion).add(dato);
  }

  // Función para obtener todos los documentos de una colección
  getCollection(coleccion: string) {
    return this.firestore.collection(coleccion).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data:any = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data }; // Combinamos el id con los datos del documento
      }))
    );
  }

  getTopScores(collection: string) {
    return this.firestore.collection(collection, ref => 
      ref.orderBy('seconds', 'asc').limit(5))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as any; // Asegúrate de que TypeScript entienda el tipo
          const id = a.payload.doc.id;
          const timestamp = data.timestamp.toDate(); // Convierte Timestamp a Date
          return { id, ...data, timestamp }; // Incluye el Date convertido
        }))
      );
  }
}
