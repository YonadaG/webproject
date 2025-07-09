<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\GuestController;
use App\Http\Controllers\Api\RoomController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


//registration
Route::post('/admin/register', [AuthController::class, 'register']);

//the admin routes(login)
Route::post('admin/login', [AuthController::class, 'login']);

//the admin routes(logout)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('admin/logout', [AuthController::class, 'logout']);

});

//the public or the routes that don't need authentication
Route::get('/rooms', [\App\Http\Controllers\Api\RoomController::class, 'index']);
Route::get('/rooms/{id}', [\App\Http\Controllers\Api\RoomController::class, 'show']);
Route::post('/booking', [\App\Http\Controllers\Api\BookingController::class, 'store']);
Route::post('/guests',[\App\Http\Controllers\Api\GuestController::class, 'store']);

//



// Admin only booking controls
Route::get('/admin/bookings', [BookingController::class, 'index']);
Route::put('/admin/bookings/{id}', [BookingController::class, 'update']);
Route::delete('/admin/bookings/{id}', [BookingController::class, 'destroy']);

// Admin only room management
Route::post('/admin/rooms', [RoomController::class, 'store']);
Route::put('/admin/rooms/{id}', [RoomController::class, 'update']);
Route::delete('/admin/rooms/{id}', [RoomController::class, 'destroy']);


// Admin view of guest info
Route::get('/admin/guests', [GuestController::class, 'index']);
Route::get('/admin/guests/{id}', [GuestController::class, 'show']);





Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
