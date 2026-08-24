using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PlantyHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class StoreCountryAsIso2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            ConvertCountry(migrationBuilder, "Orders", "Country", false);
            ConvertCountry(migrationBuilder, "Orders", "ShippingCountry", false);
            ConvertCountry(migrationBuilder, "Orders", "BillingCountry", false);
            ConvertCountry(migrationBuilder, "Customers", "Country", false);
            ConvertCountry(migrationBuilder, "AspNetUsers", "Country", true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            RevertCountry(migrationBuilder, "Orders", "Country", false);
            RevertCountry(migrationBuilder, "Orders", "ShippingCountry", false);
            RevertCountry(migrationBuilder, "Orders", "BillingCountry", false);
            RevertCountry(migrationBuilder, "Customers", "Country", false);
            RevertCountry(migrationBuilder, "AspNetUsers", "Country", true);
        }

        static void ConvertCountry(MigrationBuilder migrationBuilder, string table, string column, bool nullable)
        {
            var fallback = nullable ? "NULL" : "'BG'";
            migrationBuilder.Sql($"""
                ALTER TABLE "{table}" ALTER COLUMN "{column}" TYPE character varying(2)
                USING (
                  CASE "{column}"
                    WHEN 0 THEN 'BG'
                    WHEN 1 THEN 'DE'
                    WHEN 2 THEN 'FR'
                    WHEN 3 THEN 'PL'
                    WHEN 4 THEN 'IT'
                    WHEN 5 THEN 'PT'
                    WHEN 6 THEN 'CZ'
                    ELSE {fallback}
                  END
                );
                """);
        }

        static void RevertCountry(MigrationBuilder migrationBuilder, string table, string column, bool nullable)
        {
            var fallback = nullable ? "NULL" : "0";
            migrationBuilder.Sql($"""
                ALTER TABLE "{table}" ALTER COLUMN "{column}" TYPE integer
                USING (
                  CASE "{column}"
                    WHEN 'BG' THEN 0
                    WHEN 'DE' THEN 1
                    WHEN 'FR' THEN 2
                    WHEN 'PL' THEN 3
                    WHEN 'IT' THEN 4
                    WHEN 'PT' THEN 5
                    WHEN 'CZ' THEN 6
                    ELSE {fallback}
                  END
                );
                """);
        }
    }
}
