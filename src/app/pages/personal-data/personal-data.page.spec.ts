import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PersonalDataPage } from './personal-data.page';

describe('PersonalDataPage', () => {
  let component: PersonalDataPage;
  let fixture: ComponentFixture<PersonalDataPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalDataPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
