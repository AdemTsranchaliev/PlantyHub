using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using PlantyHub.Api.Data;

#nullable disable

namespace PlantyHub.Api.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20261016213200_OrderCodFee")]
    public partial class OrderCodFee : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CodFee",
                table: "Orders",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CodFee",
                table: "Orders");
        }
    }
}
