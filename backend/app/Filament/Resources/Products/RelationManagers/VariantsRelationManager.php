<?php

namespace App\Filament\Resources\Products\RelationManagers;

use Filament\Forms;
use Filament\Schemas\Schema;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class VariantsRelationManager extends RelationManager
{
    protected static string $relationship = 'variants';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Forms\Components\TextInput::make('attribute_name')
                    ->required()
                    ->maxLength(255)
                    ->placeholder('e.g., Color, Size'),
                Forms\Components\TextInput::make('attribute_value')
                    ->required()
                    ->maxLength(255)
                    ->placeholder('e.g., Red, XL'),
                Forms\Components\TextInput::make('price_adjustment')
                    ->numeric()
                    ->default(0),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('attribute_value')
            ->columns([
                Tables\Columns\TextColumn::make('attribute_name'),
                Tables\Columns\TextColumn::make('attribute_value'),
                Tables\Columns\TextColumn::make('price_adjustment')
                    ->money('IDR'),
            ])
            ->filters([
                //
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }
}
