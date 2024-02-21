import { LightningElement, track } from 'lwc';

export default class ImportarDatosDesdeCSV extends LightningElement {
    @track importDate;
    @track filePath;
    @track importMessage;
    @track importMessageClass;
    @track importedData; // Nueva propiedad para almacenar los datos importados
    @track columns;

    handleFileChange(event) {
        const selectedFile = event.target.files[0];
        this.filePath = selectedFile.name;

        const reader = new FileReader();
        reader.onload = () => {
            const csvData = this.csvJSON(reader.result);
            const headers = this.extractHeaders(csvData);

            this.columns = headers.map(header => ({
                label: header,
                fieldName: header,
                type: 'text'
            }));

            // Asignar los datos al componente
            this.importedData = csvData;
        };

        reader.readAsText(selectedFile);
    }

    handleDateChange(event) {
        this.importDate = event.target.value;
    }

    importData() {
        // Lógica para importar datos desde el archivo CSV (puedes implementar según tus necesidades)
        // En este ejemplo, simplemente se muestra un mensaje de éxito o error
        const success = true; // o false
        if (success) {
            this.importMessage = 'Datos importados con éxito.';
            this.importMessageClass = 'success-message';
        } else {
            this.importMessage = 'Error al importar datos. Verifica el archivo CSV.';
            this.importMessageClass = 'error-message';
        }
    }

    csvJSON(csv) {
        // Lógica para convertir el CSV a formato JSON
        const lines = csv.split('\n');
        const result = [];
        const headers = lines[0].split(',');

        for (let i = 1; i < lines.length; i++) {
            const obj = {};
            const currentLine = lines[i].split(',');

            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentLine[j];
            }

            result.push(obj);
        }

        return result;
    }

    extractHeaders(csvData) {
        // Lógica para obtener los encabezados del CSV
        // En este ejemplo, simplemente se toman las claves del primer objeto en el array
        return Object.keys(csvData[0]);
    }
}
