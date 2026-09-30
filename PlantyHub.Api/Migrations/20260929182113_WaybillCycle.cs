using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PlantyHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class WaybillCycle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Waybills_OrderId",
                table: "Waybills");

            migrationBuilder.AddColumn<string>(
                name: "Purpose",
                table: "Waybills",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "shipment");

            migrationBuilder.CreateIndex(
                name: "IX_Waybills_OrderId",
                table: "Waybills",
                column: "OrderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Waybills_OrderId",
                table: "Waybills");

            migrationBuilder.DropColumn(
                name: "Purpose",
                table: "Waybills");

            migrationBuilder.CreateIndex(
                name: "IX_Waybills_OrderId",
                table: "Waybills",
                column: "OrderId",
                unique: true);
        }
    }
}
