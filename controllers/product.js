const Product = require("../models/product.js");
const fs = require("fs");
const slugify = require("slugify");
const braintree = require("braintree");
require("dotenv").config();
const Order = require("../models/order.js");
const sgMail = require("@sendgrid/mail");
const { Console } = require("console");


sgMail.setApiKey(process.env.SENDGRID_KEY);

exports.create = async(req, res) => {
    try {
        console.log(req.fields);
        console.log(req.files);
        const { name, description, price, category, quantity, shipping } =
        req.fields;
        const { photo } = req.files;
        console.log("PHOTO========>", photo)

        switch (true) {
            case !name.trim():
                return res.json({ error: "Name is required" });
            case !description.trim():
                return res.json({ error: "Description is required" });
            case !price.trim():
                return res.json({ error: "Price is required" });
            case !category.trim():
                return res.json({ error: "Category is required" });
            case !quantity.trim():
                return res.json({ error: "Quantity is required" });
            case !shipping.trim():
                return res.json({ error: "Shipping is required" });
            case photo && photo.size > 5000000:
                return res.json({ error: "Image should be less than 1mb in size" });
        }


        const product = new Product({...req.fields, slug: slugify(name) });

        if (photo) {
            product.photo.data = fs.readFileSync(photo.path);
            product.photo.contentType = photo.type;
        }

        await product.save();
        res.json(product);
    } catch (err) {
        console.log(err);
        return res.status(400).json(err.message);
    }
};
exports.list = async(req, res) => {
    try {
        const products = await Product.find({})
            .populate("category")
            .select("-photo")
            .limit(12)
            .sort({ createdAt: -1 })
        res.json(products);
    } catch (error) {
        console.log(error);
    }
}
exports.read = async(req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug })
            .select("-photo")
            .populate("category")
        res.json(product)
    } catch (error) {
        console.log(error);
    }
};
exports.photo = async(req, res) => {
    try {
        const product = await Product.findById(req.params.productId)
            .select("photo");
        if (product.photo.data) {
            res.set("Content-Type", product.photo.contentType);
            return res.send(product.photo.data)
        }
    } catch (error) {
        console.log(error)
    }
};

exports.remove = async(req, res) => {
    try {
        const product = await Product.findByIdAndDelete(
            req.params.productId
        ).select("-photo");
        res.json(product);
    } catch (error) {
        console.log(error)
    }
}
exports.update = async (req,res)=>{
    try {
        const {name,description,price,category,quantity,shipping}=
        req.fields;
        const{photo}= req.files;
        switch(true){
            case !name.trim():
            return  res.json({error:"Name is required"})
            case !description.trim():
            return  res.json({ error: "Description is required" });
            case !price.trim():
            return  res.json({ error: "Price is required" });
            case !category.trim():
            return  res.json({ error: "Category is required" });
            case !quantity.trim():
            return  res.json({ error: "Quantity is required" });
            case !shipping.trim():
            return  res.json({ error: "Shipping is required" });
            case photo && photo.size > 1000000:
            return  res.json({ error: "Image should be less than 1mb in size" });
        }
        const update = await Product.findByIdAndUpdate(
            req.params.productId,
            {
                ...req.fields,
                slug:slugify(name),
            },
            {new:true}
        );
        if(photo){
            product.photo.data = fs.readFileSync(photo.path);
            product.photo.contentType = photo.type;
        }
        await product.save();
        res.json(product);
    } catch (error) {
        console.log(error)
    }
}
exports.filteredProducts = async (req, res) => {
    try {
      const { checked, radio } = req.body;
      
      let args = {};
      if (checked.length > 0) args.category = checked
      if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
      console.log("args => ", args);
  
      const products = await Product.find(args);
      console.log("filtered products query => ", products.length);
      res.json(products);
    } catch (err) {
      console.log(err);
    }
  }