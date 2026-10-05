using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PlantyHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class GrowingDifficulty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "GrowingDifficulty",
                table: "Products",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GrowingDifficulty",
                table: "Products");
        }
    }
}
