import pathlib
import sqlite3
import unittest

SCHEMA = pathlib.Path(__file__).resolve().parent.parent / "cloudflare/d1/migrations/0001_catalog.sql"

class AutoProCloudflareSchema(unittest.TestCase):
    def setUp(self):
        self.conn = sqlite3.connect(":memory:")
        self.conn.execute("PRAGMA foreign_keys = ON")
        self.conn.executescript(SCHEMA.read_text())

    def tearDown(self):
        self.conn.close()

    def test_empty_database_has_no_orders_or_customer_credentials(self):
        tables={row[0] for row in self.conn.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        self.assertIn("categories",tables)
        self.assertIn("products",tables)
        self.assertFalse(any("order" in name or "payment" in name or "user" in name for name in tables))

    def test_product_catalog_and_referential_integrity(self):
        self.conn.execute("INSERT INTO categories(id,name,slug) VALUES ('cat1','Parts','parts')")
        self.conn.execute("INSERT INTO products(id,category_id,name,slug,price,stock_quantity,sku,is_featured) VALUES ('p1','cat1','Demo Part','demo-part',25,2,'D-1',1)")
        self.assertEqual(self.conn.execute("SELECT count(*) FROM products").fetchone()[0],1)
        with self.assertRaises(sqlite3.IntegrityError):
            self.conn.execute("INSERT INTO products(id,category_id,name,slug,price,sku) VALUES ('p2','missing','Bad Reference','bad-ref',5,'D-2')")
        with self.assertRaises(sqlite3.IntegrityError):
            self.conn.execute("INSERT INTO products(id,name,slug,price,sku) VALUES ('p3','Bad Price','bad-price',-4,'D-3')")
        with self.assertRaises(sqlite3.IntegrityError):
            self.conn.execute("INSERT INTO products(id,name,slug,price,sku,stock_quantity) VALUES ('p4','Bad Stock','bad-stock',5,'D-4',-2)")
        with self.assertRaises(sqlite3.IntegrityError):
            self.conn.execute("INSERT INTO products(id,name,slug,price,sku,gallery) VALUES ('p5','Bad JSON','bad-json',5,'D-5','not-json')")

    def test_schema_migration_is_repeatable(self):
        self.conn.executescript(SCHEMA.read_text())
        version=self.conn.execute("SELECT migration FROM _autopro_schema_versions").fetchall()
        self.assertEqual(version,[('0001_catalog',)])

if __name__=="__main__":
    unittest.main()
