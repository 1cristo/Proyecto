import { LightningElement, track, wire } from 'lwc';
import getObjects from '@salesforce/apex/ObjectInfoProvider.getObjects';

export default class ImportarDatosDesdeCSV extends LightningElement {
    @track importMessage;
    @track importMessageClass = '';
    @track importedData;
    @track columns;
    @track fieldsToMap = [];
    @track objectsList; // Almacenará la lista de objetos de Salesforce
    @track selectedObject = ''; // Almacenará el objeto seleccionado
    @track currentStep = 'selectObject'; // Controla el paso actual del flujo

    // Utiliza @wire para obtener la lista de objetos desde Apex
    @wire(getObjects)
    objectsResult({ error, data }) {
        if (data) {
            this.objectsList = data; // data debe ser un array de { label: 'Label', value: 'API Name' }
        } else if (error) {
            console.error('Error fetching objects:', error);
            this.objectsList = [];
        }
    }

    get isSelectObjectStep() {
        return this.currentStep === 'selectObject';
    }

    get isSelectFileStep() {
        return this.currentStep === 'selectFile';
    }

    get isMapFieldsStep() {
        return this.currentStep === 'mapFields';
    }

    handleObjectChange(event) {
        this.selectedObject = event.detail.value;
    }

    handleNextToSelectFile() {
        if (this.selectedObject) {
            this.currentStep = 'selectFile';
        } else {
            this.updateImportMessage('Por favor, seleccione un objeto de Salesforce antes de continuar.', 'error');
        }
    }
    

    handleNextToMapFields() {
        if (this.importedData && this.importedData.length > 0) {
            this.currentStep = 'mapFields';
        } else {
            this.updateImportMessage('Por favor, cargue un archivo CSV antes de continuar.', 'error');
        }
    }

    handleFileChange(event) {
        const selectedFile = event.target.files[0];
        if (!selectedFile) {
            this.updateImportMessage('No se seleccionó ningún archivo.', 'error');
            return;
        }
    
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const csvData = this.csvJSON(reader.result);
                if (csvData.length === 0) {
                    throw new Error('El archivo está vacío o no tiene el formato correcto.');
                }
                this.importedData = csvData;
                // Asegura que las claves en csvData coincidan con los fieldName definidos aquí
                this.columns = this.extractHeaders(csvData).map(header => ({
                    label: header, // Visual label
                    fieldName: header, // Key in the data objects
                    type: 'text' // Assuming all data is text for simplicity
                }));
    
                // No necesitas preparar fieldsToMap aquí a menos que lo uses para otra lógica
                this.updateImportMessage('Datos preparados para importar.', 'success');
                this.currentStep = 'mapFields'; // Asegura la transición al paso de mapeo
            } catch (error) {
                this.updateImportMessage(error.message, 'error');
            }
        };
        reader.onerror = () => {
            this.updateImportMessage('Error al leer el archivo.', 'error');
        };
        reader.readAsText(selectedFile);
    }
    
    
    importData() {
        // Implementa la lógica de importación aquí
        this.updateImportMessage('Datos importados con éxito.', 'success');
    }

    handleFieldMappingChange(event) {
        const fieldName = event.target.name;
        const selectedValue = event.target.value;
        this.fieldsToMap = this.fieldsToMap.map(field => (
            field.apiName === fieldName ? { ...field, mappedColumn: selectedValue } : field
        ));
    }

    finalizeMapping() {
        console.log('Mapeo finalizado:', this.fieldsToMap);
        // Opcional: implementar acciones adicionales después del mapeo
    }

    csvJSON(csv) {
        const lines = csv.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) return [];
        
        const headers = lines[0].split(',');
        return lines.slice(1).map(line => {
            const data = line.split(',');
            return headers.reduce((obj, nextKey, index) => {
                obj[nextKey] = data[index].trim();
                return obj;
            }, {});
        });
    }
    

    extractHeaders(csvData) {
        return Object.keys(csvData[0]);
    }

    prepareFieldsForMapping(headers) {
        this.fieldsToMap = headers.map(header => ({
            label: header, // 'header' es un string, el nombre de la columna
            fieldName: header // Se asume que el nombre del campo en Salesforce es el mismo que el encabezado del CSV
        }));
    }
    

    updateImportMessage(message, type) {
        this.importMessage = message;
        this.importMessageClass = type === 'success' ? 'slds-text-color_success' : 'slds-text-color_error';
    }
}
