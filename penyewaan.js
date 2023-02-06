const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const mysql = require("mysql")
const cors = require("cors")
const moment = require("moment")

app.use(express.static(__dirname));
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


//membuat variabel untuk konfigurasi proses upload file
const storage = multer.diskStorage( {
    destination: (req, file, cb) => {
        //set file storage
        cb(null, './image');
    },
    filename: (req, file, cb) => {
        //generate file name
        cb(null, "image-"+ Date.now()+ path.extname(file.originalname))
    }
})

let upload = multer({storage: storage})

//membuat variabel u/ konfiguransi koneksi ke database
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "penyewaan_mobil"
})

db.connect(error => {
    if(error){
        console.log(error.message)
    }else{
        console.log("MySQL Connected")
    }
})

//---------------------------------- crud mobil -------------------------------------//

app.get("/mobil", (req, res) => {
    // create sql query
    let sql = "select * from mobil"

    // run query
    db.query(sql, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message // pesan error
            }
        } else {
            response = {
                count: result.length, // jumlah data
                mobil: result // isi data
            }
        }
        res.json(response) // send response
    })
})

// end-point akses data mobil berdasarkan id_mobil tertentu
app.get("/mobil/:id_mobil", (req, res) => {
    let data = {
        id_mobil: req.params.id_mobil
    }
    // create sql query
    let sql = "select * from mobil where ?"

    // run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message // pesan error
            }
        } else {
            response = {
                count: result.length, // jumlah data
                mobil: result // isi data
            }
        }
        res.json(response) // send response
    })
})

// endpoint untuk menambah data mobil baru
app.post("/mobil", upload.single("image"), (req, res) => {
    // prepare data
    let data = {
        nomor_mobil: req.body.nomor_mobil,
        merk: req.body.merk,
        jenis: req.body.jenis,
        warna: req.body.warna,
        tahun_pembuatan: req.body.tahun_pembuatan,
        biaya_sewa_per_hari: req.body.biaya_sewa_per_hari,
        image: req.file.image
    }

    if (!req.file) {
        // jika tidak ada file yang diupload
        res.json({
            message: "Tidak ada file yang dikirim"
        })
    } else {
        // create sql insert
        let sql = "insert into mobil set ?"

        // run query
        db.query(sql, data, (error, result) => {
            if(error) throw error
            res.json({
                message: result.affectedRows + " data berhasil disimpan"
            })
        })
    }
})

// endpoint untuk mengubah data mobil
app.put("/mobil", upload.single("image"), (req,res) => {
    let data = null, sql = null
    // paramter perubahan data
    let param = { id_mobil: req.body.id_mobil }

    if (!req.file) {
        // jika tidak ada file yang dikirim = update data saja
        data = {
            nomor_mobil: req.body.nomor_mobil,
            merk: req.body.merk,
            jenis: req.body.jenis,
            warna: req.body.warna,
            tahun_pembuatan: req.body.tahun_pembuatan,
            biaya_sewa_per_hari: req.body.biaya_sewa_per_hari,
            image: req.file.image
        }
    } else {
        // jika mengirim file = update data + reupload
        data = {
            nomor_mobil: req.body.nomor_mobil,
            merk: req.body.merk,
            jenis: req.body.jenis,
            warna: req.body.warna,
            tahun_pembuatan: req.body.tahun_pembuatan,
            biaya_sewa_per_hari: req.body.biaya_sewa_per_hari,
            image: req.file.image
        }

        // get data yg akan diupdate utk mendapatkan nama file yang lama
        sql = "select * from mobil where ?"
        // run query
        db.query(sql, param, (err, result) => {
            if (err) throw err
            // tampung nama file yang lama
            let fileName = result[0].image

            // hapus file yg lama
            let dir = path.join(__dirname,"image",fileName)
            fs.unlink(dir, (error) => {})
        })

    }

    // create sql update
    sql = "update mobil set ? where ?"

    // run sql update
    db.query(sql, [data,param], (error, result) => {
        if (error) {
            res.json({
                message: error.message
            })
        } else {
            res.json({
                message: result.affectedRows + " data berhasil diubah"
            })
        }
    })
})

// endpoint untuk menghapus data mobil
app.delete("/mobil/:id_mobil", (req,res) => {
    let param = {id_mobil: req.params.id_mobil}

    // ambil data yang akan dihapus
    let sql = "select * from mobil where ?"
    // run query
    db.query(sql, param, (error, result) => {
        if (error) throw error
        
        // tampung nama file yang lama
        let fileName = result[0].image

        // hapus file yg lama
        let dir = path.join(__dirname,"image",fileName)
        fs.unlink(dir, (error) => {})
    })

    // create sql delete
    sql = "delete from mobil where ?"

    // run query
    db.query(sql, param, (error, result) => {
        if (error) {
            res.json({
                message: error.message
            })
        } else {
            res.json({
                message: result.affectedRows + " data berhasil dihapus"
            })
        }      
    })
})

//------------------------------------ crud pelanggan -------------------------------------------------//

// end-point akses data pelanggan
app.get("/pelanggan", (req, res) => {
    // create sql query
    let sql = "select * from pelanggan"

    // run query
    db.query(sql, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message // pesan error
            }
        } else {
            response = {
                count: result.length, // jumlah data
                pelanggan: result // isi data
            }
        }
        res.json(response) // send response
    })
})

// end-point akses data pelanggan berdasarkan id_pelanggan tertentu
app.get("/pelanggan/:id_pelanggan", (req, res) => {
    let data = {
        id_pelanggan: req.params.id_pelanggan
    }
    // create sql query
    let sql = "select * from pelanggan where ?"

    // run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message // pesan error
            }
        } else {
            response = {
                count: result.length, // jumlah data
                pelanggan: result // isi data
            }
        }
        res.json(response) // send response
    })
})

// end-point menyimpan data pelanggan
app.post("/pelanggan", (req, res) => {

    // prepare data
    let data = {
        nama_pelanggan: req.body.nama_pelanggan,
        alamat_pelanggan: req.body.alamat_pelanggan,
        kontak: req.body.kontak
    }

    // create sql query insert
    let sql = "insert into pelanggan set ?"

    // run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + " data inserted"
            }
        }
        res.json(response) // send response
    })
})

// end-point mengubah data pelanggan
app.put("/pelanggan", (req, res) => {

    // prepare data
    let data = [
        // data
        {
            nama_pelanggan: req.body.nama_pelanggan,
            alamat_pelanggan: req.body.alamat_pelanggan,
            kontak: req.body.kontak
        },

        // parameter (primary key)
        {
            id_pelanggan: req.body.id_pelanggan
        }
    ]

    // create sql query update
    let sql = "update pelanggan set ? where ?"

    // run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + " data updated"
            }
        }
        res.json(response) // send response
    })
})

// end-point menghapus data pelanggan berdasarkan id_pelanggan
app.delete("/pelanggan/:id_pelanggan", (req, res) => {
    // prepare data
    let data = {
        id_pelanggan: req.params.id_pelanggan
    }

    // create query sql delete
    let sql = "delete from pelanggan where ?"

    // run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + "data deleted"
            }
        }
        res.json(response) // send response
    })
})

//------------------------------------------------------ crud karyawan ----------------------------------------------------//

// end-point akses data karyawan
app.get("/karyawan", (req, res) => {
    // create sql query
    let sql = "select * from karyawan"

    // run query
    db.query(sql, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message // pesan error
            }
        } else {
            response = {
                count: result.length, // jumlah data
                karyawan: result // isi data
            }
        }
        res.json(response) // send response
    })
})

// end-point akses data karyawan berdasarkan id_karyawan tertentu
app.get("/karyawan/:id_karyawan", (req, res) => {
    let data = {
        id_karyawan: req.params.id_karyawan
    }
    // create sql query
    let sql = "select * from karyawan where ?"

    // run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message // pesan error
            }
        } else {
            response = {
                count: result.length, // jumlah data
                karyawan: result // isi data
            }
        }
        res.json(response) // send response
    })
})

// end-point menyimpan data karyawan
app.post("/karyawan", (req, res) => {

    // prepare data
    let data = {
        nama_karyawan: req.body.nama_karyawan,
        alamat_karyawan: req.body.alamat_karyawan,
        kontak: req.body.kontak,
        username: req.body.username,
        password: req.body.password
    }

    // create sql query insert
    let sql = "insert into karyawan set ?"

    // run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + " data inserted"
            }
        }
        res.json(response) // send response
    })
})

// end-point mengubah data karyawan
app.put("/karyawan", (req, res) => {

    // prepare data
    let data = [
        // data
        {
            nama_karyawan: req.body.nama_karyawan,
            alamat_karyawan: req.body.alamat_karyawan,
            kontak: req.body.kontak,
            username: req.body.username,
            password: req.body.password
        },

        // parameter (primary key)
        {
            id_karyawan: req.body.id_karyawan
        }
    ]

    // create sql query update
    let sql = "update karyawan set ? where ?"

    // run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + " data updated"
            }
        }
        res.json(response) // send response
    })
})

// end-point menghapus data karyawan berdasarkan id_karyawan
app.delete("/karyawan/:id_karyawan", (req, res) => {
    // prepare data
    let data = {
        id_karyawan: req.params.id_karyawan
    }

    // create query sql delete
    let sql = "delete from karyawan where ?"

    // run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + "data deleted"
            }
        }
        res.json(response) // send response
    })
})


//---------------------------------- transaksi --------------------------------------------//

app.post("/sewa", (req, res) => {
    let data = {
        id_mobil: req.body.id_mobil,
        id_karyawan: req.body.id_karyawan,
        id_pelanggan: req.body.id_pelanggan,
        tgl_sewa: moment().format('YYYY-MM-DD HH:mm:ss'),
        tgl_kembali: req.body.tgl_kembali,
        total_bayar: biaya_sewa_per_hari * (tgl_kembali - tgl_sewa)
    }

    let sewa = JSON.parse(req.body.sewa)

    let sql = "insert into sewa set ?"

    db.query(sql, data, (error, result) => {
        let response = null

        if(error){
            res.json({message: error.message})
        } else {
            let IDTerakhir = result.insertID

            let data = []
            for (let index = 0; index < sewa.length; index++){
                data.push([
                    IDTerakhir, sewa[index].id_sewa
                ])
            }

            let sql = "insert into sewa values ?"

            db.query(sql, [data], (error, result) => {
                if(error){
                    res.json({message: error.message})
                }else{
                    res.json({message: "Data has been inserted"})
                }
            })
        }
    })
})

app.get("/sewa", (req, res) => {
    let sql = "select * from s.id_sewa, s.id_pelanggan, p.nama_pelanggan, p.alamat_pelanggan, p.kontak, s.id_mobil, m.nomor_mobil, m.merk, m.jenis, m.warna, m,image, s.tgl_sewa, s.tgl_kembali, m.biaya_sewa_per_hari, s.total_bayar, k.nama_karyawan, k.kontak" +
    " from sewa s join pelanggan p on s.id_pelanggan = p.id_pelanggan" +
    " join karyawan k on p.id_karyawan = k.id_karyawan" +
    " join mobil m on p.id_mobil = m.id_mobil"

    db.query(sql, (error, result) => {
        if(error) {
            res.json({message: error.message})
        } else {
            res.json({
                count: result.length,
                penyewa: result
            })
        }
    })
})

app.delete("/sewa/:id_sewa", (req, res) => {
    let param = { id_sewa: req.params.id_siswa }

    let sql = "delete from sewa where ? "

    db.query(sql, param, (error, result) => {
        if(error){
            res.json({message: error.message})
        } else {
            res.json({message: "Data has been deleted"})
        }
    })
})



app.listen(8000, () =>{
    console.log("bisa");
})


