using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PlantyHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class ReviewListIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProductReviews_ProductId_Status",
                table: "ProductReviews");

            migrationBuilder.CreateIndex(
                name: "IX_ProductReviews_ProductId_Status_CreatedAt",
                table: "ProductReviews",
                columns: new[] { "ProductId", "Status", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductReviews_ProductId_Status_Rating",
                table: "ProductReviews",
                columns: new[] { "ProductId", "Status", "Rating" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProductReviews_ProductId_Status_CreatedAt",
                table: "ProductReviews");

            migrationBuilder.DropIndex(
                name: "IX_ProductReviews_ProductId_Status_Rating",
                table: "ProductReviews");

            migrationBuilder.CreateIndex(
                name: "IX_ProductReviews_ProductId_Status",
                table: "ProductReviews",
                columns: new[] { "ProductId", "Status" });
        }
    }
}
