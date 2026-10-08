import type { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../conf/dbConnection.ts";

export class ProductController {
    public async getProducts(_req:Request, res:Response) {
        try {
            const [products] = await pool.execute<RowDataPacket[]>(
                "select id, name, price, stock, description, brand, img from products where active = ?",
                [true],
            );

            res.json(products);
        }
        catch (error){
            res.status(500).json({message: "internal server error"})
        }
    }

    public async getProductById(req:Request, res:Response) {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id) || id <= 0) {
                res.status(400).json({message: "Invalid id"});
                return;
            }

            const [products] = await pool.execute<RowDataPacket[]>(
                "select id, name, price, stock, description, brand, img from products where id = ? and active = ?",
                [id, true],
            )

            if (!products[0]) { 
                res.status(404).json({message: "product not found"})
                return;
            }

            res.json(products[0]);
        }
        catch {
            res.status(500).json({message: "internal server error"})
        }
    }

    public async  createProduct(req:Request, res:Response) {
        try {
            const name = req.body.name;
            const price = typeof req.body.price === "string" ? parseFloat(req.body.price) : req.body.price;
            const stock = req.body.stock;
            const description = req.body.description;
            const brand = req.body.brand;
            const img = req.body.img;

            if (!name || name.trim().length === 0 ){
                res.status(400).json({message: "Product name is required"});
                return;
            }

            if (typeof price !== "number" || price <= 0) {
                res.status(400).json({message: "Price must be numeric and greater than 0"})
                return;
            } 

            if (!Number.isInteger(stock) || stock < 0) {
                res.status(400).json({message: "Stock must be integer and greater than 0"}); 
                return;
            }

            if (!description || description.trim().length === 0 ){
                res.status(400).json({message: "Product description is required"});
                return;
            }

            await pool.execute(
                "insert into products (name, price, stock, description, brand, img, active) values (?, ?, ?, ?, ?, ?, ?)",
                [name, price, stock, description, brand, img, true] 
            )

            res.status(201).json({message: "Product created"});

        }
        catch{
            res.status(500).json({message: "Internal server error"});
        }
    }

    public async updateProduct (req:Request, res:Response){
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id) || id <= 0) {
                res.status(400).json({message: "Invalid id"})
                return;
            }

            const name = req.body.name;
            const price = typeof req.body.price === "string" ? parseFloat(req.body.price) : req.body.price;
            const stock = req.body.stock;
            const description = req.body.description;
            const brand = req.body.brand;
            const img = req.body.img;


            if (!name || name.trim().length === 0 ){
                res.status(400).json({message: "Product name is required"});
                return;
            }

            if (typeof price !== "number" || isNaN(price) || price <= 0) {
                res.status(400).json({message: "Price must be a number greater than 0"})
                return;
            } 

            if (!Number.isInteger(stock) || stock < 0) {
                res.status(400).json({message: "Stock must be a positive integer"});
                return;
            }

            if (!description || description.trim().length === 0 ){
                res.status(400).json({message: "Product description is required"});
                return;
            }

            const [result] = await pool.execute<ResultSetHeader>(
                "update products set name = ?, price = ?, stock = ?, description = ?, brand = ?, img = ? where id = ? and active = ?",
                [name, price, stock, description, brand, img, id, true],
            )

            if (result.affectedRows === 0) {
                res.status(404).json({message: "product not found"});
                return;
            }

            res.status(200).json({message:'product updated'});
        }
        catch {
            res.status(500).json({message: "Internal server error"})
        }
    }

    public async deleteProduct (req:Request, res:Response) {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id) || id <= 0) {
                res.status(400).json({message: "Invalid id"});
                return;
            }
            
            const [result] = await pool.execute<ResultSetHeader> (
                "update products set active = ? where id = ? and active = ?",
                [false, id, true]
            )
            if (result.affectedRows === 0) {
                res.status(404).json({message: "Product not found"});
                return;
            }
            res.json({message: "Product deleted"});
        }
        catch {
            res.status(500).json({message: "Internal server error"});
        }
    }

    public async changePrice (req:Request, res:Response) {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id) || id <= 0) {
                res.status(400).json({message: "Invalid id"});
                return;
            }

            const price = typeof req.body.price === "string" ? parseFloat(req.body.price) : req.body.price;
            
            if (typeof price !== "number" || isNaN(price) || price <= 0) {
                res.status(400).json({message: "Price must be a number greater than 0"})
                return;
            } 

            const [result] = await pool.execute<ResultSetHeader> (
                "update products set price = ? where id = ? and active = ?",
                [price, id, true]
            )
            
            if (result.affectedRows === 0) {
                res.status(404).json({message: "Product not found"});
                return;
            }
            
            res.json({message: "Product updated"});
        }
        catch (error){
            res.status(500).json({message: "Internal server error"});
        }            
    }
}
