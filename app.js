const express =  require('express');
const path = require('path');

//express app
const app = express();

// //Middleware to serve static files, i.e. public folder on current project directory
 app.use(express.static(path.join(__dirname, 'public')));

//Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Pipeline parameters and thresholds
const pipelineParameters ={
    internalPressure: 85,       //in bar
    externalPressure: 1,        //in bar (atmospheric)
    pipelineTemperature: 40,    //in degC
    ambientTemperature: 27,     //in degC
    materialStrength: 100,      //in Mpa
    wallThickness: 10,          //in mm
    diameter: 600,              // in mm
    fluidType: 'liquid', 
    flowRate: 150,              //in m3 per hour
    vicousity: 0.004,           //in pa.s
    density: 850,               //in <kg/m3
    windSpeed: 5,               //in m/s
    leaksize:0,                 //in mm2
};

const ruptureThresholds ={
    pressureDropRate: 5,         //in bar per second
    maxAllowablePressure: 90,    //in bar
    minWallThickness: 8,         //mm
    criticalFlowRateChange: 20   //cubic meters per hour
};

function calculatePressureDropRate(internalPressure, externalPressure) {
    return (internalPressure - externalPressure) / 10;
  }
  
  function calculateCriticalPressure(materialStrength, wallThickness, diameter) {
    return (2 * materialStrength * wallThickness) / diameter;
  }

function isRuptureDetected(params, thresholds){
    let{internalPressure, externalPressure, materialStrength, wallThickness, diameter, flowRate} =params

    const pressureDropRate = calculatePressureDropRate(internalPressure, externalPressure);
    const criticalPressure = calculateCriticalPressure(materialStrength, wallThickness, diameter);

    if(internalPressure > criticalPressure){
        return 'Pressure exceeds crititical limit!';
    }

    if(pressureDropRate> thresholds.pressureDropRate){
        return 'Sudden pressure drop detected! Possible rupture.';
    }

    const flowRateChange = Math.abs(flowRate -params.flowRate);
    
    if(flowRateChange > thresholds.criticalFlowRateChange){
        return  'Signicant change in flow rate! Possible rupture.';
    }

    return 'Pipeline operating within safe parameters.';
}

//Route to display the monitoring results
app.get('/', (req, res) => {
    const statusMessage = isRuptureDetected(pipelineParameters, ruptureThresholds);
    res.render('index', {statusMessage, pipelineParameters});
    });


    app.get('/monitor', (req, res) =>{
        res.render('monitor', {pipelineParameters, ruptureThresholds});
    });
    
    //404 page
    app.use((req, res) =>{
        res.status(404).render('404');
    });

//Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});

