using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using PlantyHub.Api.Data;

#nullable disable

namespace PlantyHub.Api.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(AppDbContext))]
    [Migration("20260924120000_AddProductMediaAndSpecs")]
    public partial class AddProductMediaAndSpecs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GalleryJson",
                table: "Products",
                type: "text",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.AddColumn<string>(
                name: "VideoPoster",
                table: "Products",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VideoUrl",
                table: "Products",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SpecsJson",
                table: "ProductTranslations",
                type: "text",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.AddColumn<string>(
                name: "VideoBadge",
                table: "ProductTranslations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VideoText",
                table: "ProductTranslations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VideoTitle",
                table: "ProductTranslations",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "GalleryJson", table: "Products");
            migrationBuilder.DropColumn(name: "VideoPoster", table: "Products");
            migrationBuilder.DropColumn(name: "VideoUrl", table: "Products");
            migrationBuilder.DropColumn(name: "SpecsJson", table: "ProductTranslations");
            migrationBuilder.DropColumn(name: "VideoBadge", table: "ProductTranslations");
            migrationBuilder.DropColumn(name: "VideoText", table: "ProductTranslations");
            migrationBuilder.DropColumn(name: "VideoTitle", table: "ProductTranslations");
        }
    }
}
