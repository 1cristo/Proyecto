import { LightningElement, track } from 'lwc';

export default class ImportarDatosDesdeCSV extends LightningElement {
    @track importMessage;
    @track importMessageClass = '';
    @track importedData;
    @track columns;
    @track fieldsToMap = [];

    get columnOptions() {
        // Genera las opciones para el mapeo de campos basándose en las columnas disponibles
        return this.columns ? this.columns.map(column => ({ label: column.label, value: column.fieldName })) : [];
    }

    handleFileChange(event) {
        // Maneja la selección de un archivo CSV, lee su contenido y procesa los datos
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
                const headers = this.extractHeaders(csvData);

                this.columns = headers.map(header => ({
                    label: header,
                    fieldName: header,
                    type: 'text'
                }));

                // Prepara los campos para el mapeo basándose en los encabezados importados
                this.prepareFieldsForMapping(headers);

                this.updateImportMessage('Datos preparados para importar.', 'success');
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
        // Lugar para implementar la lógica de importación real utilizando `importedData`
        this.updateImportMessage('Datos importados con éxito.', 'success');
    }

    handleFieldMappingChange(event) {
        // Actualiza el mapeo de campos basado en la selección del usuario
        const fieldName = event.target.name;
        const selectedValue = event.target.value;
        this.fieldsToMap = this.fieldsToMap.map(field => (
            field.apiName === fieldName ? { ...field, mappedColumn: selectedValue } : field
        ));
    }
    

    finalizeMapping() {
        // Implementa lo que necesitas hacer una vez finalizado el mapeo
        console.log('Mapeo finalizado:', this.fieldsToMap);
    }

    csvJSON(csv) {
        // Convierte el contenido del CSV a JSON
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
        // Extrae los encabezados del CSV para su uso en columnas y mapeo
        return Object.keys(csvData[0]);
    }

    prepareFieldsForMapping(headers) {
        // Prepara los campos disponibles para mapeo basándose en los encabezados del CSV
        this.fieldsToMap = headers.map(header => ({
            label: header,
            apiName: header,
            mappedColumn: ''
        }));
    }

    updateImportMessage(message, type) {
        // Actualiza el mensaje de importación para el usuario
        this.importMessage = message;
        this.importMessageClass = type === 'success' ? 'slds-text-color_success' : 'slds-text-color_error';
    }
}
