using System;
using System.Threading.Tasks;
using FsCheck;
using FsCheck.Xunit;
using Microsoft.EntityFrameworkCore;
using NaarNoor.Domain;
using NaarNoor.Domain.ValueObjects;
using NaarNoor.Infrastructure.Persistence;
using NaarNoor.Infrastructure.Repositories;
using Xunit;

namespace NaarNoor.Infrastructure.Tests.Persistence
{
    /// <summary>
    /// Property 7: Repository CRUD Round-Trip
    /// Validates that Create-Read-Update-Delete operations work correctly
    /// in isolation and in sequence (round-trip scenarios).
    /// </summary>
    public class RepositoryCrudPropertyTests : IAsyncLifetime
    {
        private ApplicationDbContext _context;

        public async Task InitializeAsync()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase("TestDb_" + Guid.NewGuid())
                .Options;
            _context = new ApplicationDbContext(options);
            await _context.Database.EnsureCreatedAsync();
        }

        public async Task DisposeAsync()
        {
            await _context.Database.EnsureDeletedAsync();
            _context.Dispose();
        }

        [Property(MaxTest = 100)]
        public async Task Property_CreateOperation_PersistsValidChef(string name, string specialization)
        {
            // Arrange: Valid chef data
            if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(specialization))
                return; // Skip invalid inputs

            var chef = new Chef(name, specialization, yearsOfExperience: 5, rating: 4.5m);
            var repository = new Repository<Chef>(_context);

            // Act: Create
            await repository.AddAsync(chef);
            await _context.SaveChangesAsync();

            // Assert: Chef exists in database
            var retrieved = await repository.GetByIdAsync(chef.Id);
            Assert.NotNull(retrieved);
            Assert.Equal(name, retrieved.Name);
            Assert.Equal(specialization, retrieved.Specialization);
        }

        [Property(MaxTest = 100)]
        public async Task Property_ReadOperation_ReturnsCorrectEntity(string name)
        {
            // Arrange: Create a chef
            if (string.IsNullOrWhiteSpace(name))
                return;

            var chef = new Chef(name, "Italian", yearsOfExperience: 3, rating: 4.0m);
            var repository = new Repository<Chef>(_context);
            await repository.AddAsync(chef);
            await _context.SaveChangesAsync();

            // Act: Read by ID
            var retrieved = await repository.GetByIdAsync(chef.Id);

            // Assert: Retrieved data matches
            Assert.NotNull(retrieved);
            Assert.Equal(chef.Id, retrieved.Id);
            Assert.Equal(chef.Name, retrieved.Name);
        }

        [Property(MaxTest = 100)]
        public async Task Property_UpdateOperation_PersistsChanges(string initialName, string updatedName)
        {
            // Arrange
            if (string.IsNullOrWhiteSpace(initialName) || string.IsNullOrWhiteSpace(updatedName))
                return;

            var chef = new Chef(initialName, "French", yearsOfExperience: 2, rating: 3.5m);
            var repository = new Repository<Chef>(_context);
            await repository.AddAsync(chef);
            await _context.SaveChangesAsync();

            // Act: Update (using reflection to update name as it may be immutable)
            var retrieved = await repository.GetByIdAsync(chef.Id);
            var updatedChef = new Chef(updatedName, retrieved.Specialization, retrieved.YearsOfExperience, retrieved.Rating);
            updatedChef.SetId(chef.Id);
            await repository.UpdateAsync(updatedChef);
            await _context.SaveChangesAsync();

            // Assert: Changes persisted
            var final = await repository.GetByIdAsync(chef.Id);
            Assert.Equal(updatedName, final.Name);
        }

        [Property(MaxTest = 100)]
        public async Task Property_DeleteOperation_RemovesEntity(string name)
        {
            // Arrange
            if (string.IsNullOrWhiteSpace(name))
                return;

            var chef = new Chef(name, "Spanish", yearsOfExperience: 1, rating: 3.0m);
            var repository = new Repository<Chef>(_context);
            await repository.AddAsync(chef);
            await _context.SaveChangesAsync();
            var chefId = chef.Id;

            // Act: Delete
            await repository.DeleteAsync(chef);
            await _context.SaveChangesAsync();

            // Assert: Entity removed
            var retrieved = await repository.GetByIdAsync(chefId);
            Assert.Null(retrieved);
        }

        [Property(MaxTest = 100)]
        public async Task Property_RoundTripCreateReadUpdate_MaintainsConsistency(string name, int experience)
        {
            // Arrange
            if (string.IsNullOrWhiteSpace(name) || experience < 0)
                return;

            var initialRating = Math.Min(5.0m, Math.Max(0.0m, experience * 0.5m));
            var chef = new Chef(name, "Japanese", yearsOfExperience: experience, rating: initialRating);
            var repository = new Repository<Chef>(_context);

            // Act 1: Create
            await repository.AddAsync(chef);
            await _context.SaveChangesAsync();

            // Act 2: Read
            var afterCreate = await repository.GetByIdAsync(chef.Id);

            // Act 3: Update
            var updatedChef = new Chef(name + " Updated", afterCreate.Specialization, 
                experience + 1, afterCreate.Rating + 0.5m);
            updatedChef.SetId(chef.Id);
            await repository.UpdateAsync(updatedChef);
            await _context.SaveChangesAsync();

            // Act 4: Final Read
            var afterUpdate = await repository.GetByIdAsync(chef.Id);

            // Assert: Full round-trip consistency
            Assert.NotNull(afterCreate);
            Assert.NotNull(afterUpdate);
            Assert.Equal(chef.Id, afterCreate.Id);
            Assert.Equal(chef.Id, afterUpdate.Id);
            Assert.True(afterUpdate.YearsOfExperience > afterCreate.YearsOfExperience);
        }

        [Property(MaxTest = 50)]
        public async Task Property_BulkCrudOperations_MaintainIntegrity(int operationCount)
        {
            // Arrange
            var validCount = Math.Min(20, Math.Max(1, operationCount));
            var repository = new Repository<Chef>(_context);

            // Act & Assert: Multiple creates
            for (int i = 0; i < validCount; i++)
            {
                var chef = new Chef($"Chef_{i}", "Various", yearsOfExperience: i, rating: (decimal)(i % 5));
                await repository.AddAsync(chef);
            }
            await _context.SaveChangesAsync();

            // Assert: All created successfully
            var all = await repository.GetAllAsync();
            Assert.True(all.Count >= validCount);
        }
    }

    /// <summary>
    /// Helper extension to set ID for testing
    /// </summary>
    internal static class ChefTestExtensions
    {
        public static void SetId(this Chef chef, int id)
        {
            typeof(Chef).GetProperty("Id")?.SetValue(chef, id);
        }
    }
}
