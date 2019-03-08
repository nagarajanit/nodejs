    const express = require('express');
    const bodyParser = require('body-parser');
    const fileCRUD = require('./Products/fileCRUD');
    const billCRUD = require('./Billing/BillCRUD');
    const myErrorLogger = require('./Utilities/errorLogger');
    const export2Excel = require('./export2excel');

    const RptFileName="C:\\ShopRetail\\Input\\Output\\Report.xlsx";

    const fs = require('fs');
    const app = express();
    const filePath= "C:\\ShopRetail\\Input\\Products.json";

    app.use((req,resp,next)=>{
        resp.setHeader("Access-Control-Allow-Origin","*");

        resp.setHeader("Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Content-disposition, Accept");

        resp.setHeader("Access-Control-Allow-Methods",
        "GET, POST, PATCH, DELETE, OPTIONS");

        next();
    });

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended:false}));

    app.get('/api/getProducts',(req,resp,next)=>{

    let products=[];

    products = fileCRUD.getProducts();

        resp.status(200).json({
            'messsage': 'Read Successful',
            'data': products
        })
        resp.end();
    });

    app.post('/api/addProducts',(req,resp,next)=>{

        let addingproduct = req.body; 
        
    let addedproduct= fileCRUD.addProduct(addingproduct);

        resp.status(201).json({
            'message': "Added Successfully",
            "product": addedproduct
        });
        
    });

    app.put('/api/updateProduct',(req,resp,next)=>{    

        let updateProduct = req.body;

        let isUpdated= fileCRUD.updateProduct(updateProduct);

        let responseMessage="";

    if(isUpdated){
        responseMessage = "Updated Successfully";
    }
    else{
        responseMessage= "Please check does that product Available";
    }

        resp.status(200).json({
            'message': responseMessage
        })
    });

    app.delete('/api/deleteProduct/:id',(req,resp,next)=>{

        let deleteProductID = req.params.id;
        
        let isDeleted = fileCRUD.deleteProduct(deleteProductID);

        if(isDeleted){
            responseMessage = "Deleted Successfully";        
        }
        else{
            responseMessage = "Please check does that product Available";
        }

        resp.status(200).json({
            'message': responseMessage
        })
        
    });

    app.get('/api/getBillsByDate',(req,resp,next)=>{

        let rptdate = req.query.rptdt;

        let filterByDate= (new Date(rptdate)).toLocaleDateString('en-US');
    
        let billDetails= billCRUD.getBillbyDate(filterByDate);

        let jsonBills = JSON.parse(billDetails);    
        
        resp.status(200);
        export2Excel.CreateReport(jsonBills,resp);    

        // resp.json({
        //     'message': 'Get Bill Successful',
        //     'filteredInvoices':jsonBills.filteredInvoices,
        //     'filteredBills':jsonBills.filterdBills
        // })
    });


    app.post('/api/NewBill',(req,resp,next)=>{
        
        let newBills = req.body;
    
    let newInvoiceID= billCRUD.CreateBill(newBills);

        resp.status(200).json({
            'message': 'New Bill Generated',
            'invoiceID': newInvoiceID
        });
    })

    app.get('/api/getOrders/:customername',(req,resp,next)=>{
        let customername = req.params.customername;

        let billDetails= billCRUD.getOrders(customername);

        let jsonBills = JSON.parse(billDetails); 

        resp.status(200).json({
            'message': 'Read successfull',
            'Invoices':jsonBills.filteredInvoices,
            'Bills':jsonBills.filterdBills
        });
    });

    app.get('*', (req, res, next) => {
        let err = new Error();
        err.status = 404;
        next(err);
    });

    app.use(myErrorLogger);

    module.exports = app;
