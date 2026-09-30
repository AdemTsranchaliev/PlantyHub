using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PlantyHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class WaybillPayer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "DeliveryCost",
                table: "Waybills",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Direction",
                table: "Waybills",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "merchant_to_customer");

            migrationBuilder.AddColumn<string>(
                name: "Payer",
                table: "Waybills",
                type: "nvarchar(16)",
                maxLength: 16,
                nullable: false,
                defaultValue: "customer");

            migrationBuilder.Sql("""
                UPDATE Waybills
                SET Direction = 'customer_to_merchant', Payer = 'merchant'
                WHERE Purpose = 'return';
                UPDATE Waybills
                SET Direction = 'merchant_to_customer', Payer = 'merchant'
                WHERE Purpose = 'replacement';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeliveryCost",
                table: "Waybills");

            migrationBuilder.DropColumn(
                name: "Direction",
                table: "Waybills");

            migrationBuilder.DropColumn(
                name: "Payer",
                table: "Waybills");
        }
    }
}
