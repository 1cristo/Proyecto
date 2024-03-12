import { LightningElement, track } from 'lwc';

export default class ImportarDatosDesdeCSV extends LightningElement {
    importDate;
    filePath;
    importMessage;
    importMessageClass;
    @track importedData; // Si planeas usarla posteriormente
    @track columns;

    handleFileChange(event) {
        const selectedFile = event.target.files[0];
        if (!selectedFile) {
            this.showErrorMessage('No se seleccionó ningún archivo.');
            return;
        }

        this.filePath = selectedFile.name;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const csvData = this.csvJSON(reader.result);
                if (csvData.length === 0) {
                    throw new Error('El archivo está vacío o no tiene el formato correcto.');
                }
                this.importedData = csvData; // Asignar datos procesados a importedData si se usará
                const headers = this.extractHeaders(csvData);

                this.columns = headers.map(header => ({
                    label: header,
                    fieldName: header,
                    type: 'text'
                }));

                this.importMessage = 'Datos preparados para importar.';
                this.importMessageClass = 'slds-text-color_success';
                // this.navigateAfterImport(); // Implementar esta función si es necesario
            } catch (error) {
                this.showErrorMessage(error.message);
            }
        };
        reader.onerror = () => {
            this.showErrorMessage('Error al leer el archivo.');
        };
        reader.readAsText(selectedFile);
    }

    handleDateChange(event) {
        this.importDate = event.target.value;
    }

    importData() {
        // Aquí deberías implementar la lógica real de importación utilizando `importedData`
        this.showSuccessMessage('Datos importados con éxito.');
    }

    csvJSON(csv) {
        const lines = csv.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) return [];
        
        const result = [];
        const headers = lines[0].split(',');

        for (let i = 1; i < lines.length; i++) {
            const obj = {};
            const currentLine = lines[i].split(',');

            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentLine[j].trim();
            }
            result.push(obj);
        }
        return result;
    }

    extractHeaders(csvData) {
        return Object.keys(csvData[0]);
    }

    showErrorMessage(message) {
        this.importMessage = message;
        this.importMessageClass = 'slds-text-color_error'; // Asegúrate de que esta clase exista o es correcta
    }

    // Implementar si es necesario
    showSuccessMessage(message) {
        this.importMessage = message;
        this.importMessageClass = 'slds-text-color_success'; // Asegúrate de que esta clase exista o es correcta
    }

    // Si se necesita navegación posterior a la importación
    // navigateAfterImport() {
    //     // Implementación de navegación
    // }
}
