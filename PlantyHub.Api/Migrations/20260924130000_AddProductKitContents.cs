using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using PlantyHub.Api.Data;

#nullable disable

namespace PlantyHub.Api.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260924130000_AddProductKitContents")]
    public partial class AddProductKitContents : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "KitJson",
                table: "Products",
                type: "text",
                nullable: false,
                defaultValue: "{}");

            migrationBuilder.Sql("""
                UPDATE "Products"
                SET "KitJson" = '{"pods":12,"caps":12,"nutrientMl":100}'
                WHERE "Slug" IN ('herb-mix-12', 'spice-mix-12');
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "KitJson", table: "Products");
        }
    }
}
